import { google, gmail_v1, OAuth2Client } from 'googleapis';
import OpenAI from 'openai';
import { storage } from '../config/storage';
import { emails, tasks, type InsertEmail, type InsertTask } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export class GmailService {
  private gmail: gmail_v1.Gmail;
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      env.GMAIL_CLIENT_ID,
      env.GMAIL_CLIENT_SECRET,
      env.GMAIL_REDIRECT_URI
    );

    // Set credentials if we have a refresh token
    if (env.GMAIL_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: env.GMAIL_REFRESH_TOKEN,
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async getAuthUrl(): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async getConnectionStatus() {
    try {
      // Check if we have valid credentials
      if (!this.oauth2Client.credentials?.access_token && !this.oauth2Client.credentials?.refresh_token) {
        return { connected: false, errorMessage: "No authentication tokens" };
      }

      // Try to make a simple API call to verify connection
      await this.gmail.users.getProfile({ userId: 'me' });
      
      return { 
        connected: true, 
        lastSync: new Date().toISOString() 
      };
    } catch (error) {
      logger.error('Gmail connection check failed', error);
      return { 
        connected: false, 
        errorMessage: "Authentication failed - please reconnect" 
      };
    }
  }

  async handleAuthCallback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    
    // Store the refresh token (you'd want to save this securely)
    logger.info('Gmail OAuth successful', { 
      hasRefreshToken: !!tokens.refresh_token 
    });
    
    return tokens;
  }

  async syncEmails(maxResults: number = 50): Promise<void> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'is:unread OR label:needs-response',
      });

      const messages = response.data.messages ?? [];

      for (const message of messages) {
        if (message.id) {
          await this.processMessage(message.id);
        }
      }

      logger.info(`Synced ${messages.length} emails`);
    } catch (error) {
      logger.error('Failed to sync emails', error);
      throw error;
    }
  }

  private async processMessage(messageId: string): Promise<void> {
    try {
      const message = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const payload = message.data.payload;
      const headers = payload?.headers ?? [];
      const subject = headers.find((h) => h.name === 'Subject')?.value || '';
      const from = headers.find((h) => h.name === 'From')?.value || '';
      const to = headers.find((h) => h.name === 'To')?.value || '';
      const date = headers.find((h) => h.name === 'Date')?.value || '';

      // Extract email and name from "Name <email>" format
      const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/) || [null, from, from];
      const fromName = fromMatch[1]?.trim();
      const fromEmail = fromMatch[2]?.trim() || from;

      // Get email body
      const body = this.extractEmailBody(payload);
      
      // Determine context and priority using AI
      const contextAnalysis = await this.analyzeEmailContext(subject, body, fromEmail);
      
      // Check if email already exists
      try {
        const existingEmail = await storage.getEmailByGmailId(messageId);

        if (!existingEmail) {
        // Create email record
        const emailData: InsertEmail = {
          gmailId: messageId,
          threadId: message.data.threadId || '',
          subject,
          fromEmail,
          fromName,
          toEmail: to,
          body,
          snippet: message.data.snippet || '',
          status: 'unread',
          context: contextAnalysis.context,
          priority: contextAnalysis.priority,
          receivedAt: new Date(date),
          responseNeededBy: contextAnalysis.responseNeededBy,
          aiSuggestedResponse: contextAnalysis.suggestedResponse,
          labels: message.data.labelIds || [],
        };

        await storage.createEmail(emailData);

        // Create follow-up task if response is needed
        if (contextAnalysis.needsResponse) {
          const taskData: InsertTask = {
            title: `Respond to: ${subject}`,
            description: `Email from ${fromName || fromEmail}\n\nSuggested response:\n${contextAnalysis.suggestedResponse}`,
            status: 'todo',
            priority: contextAnalysis.priority,
            context: contextAnalysis.context,
            dueDate: contextAnalysis.responseNeededBy,
          };

          await storage.createTask(taskData);
        }

        logger.info('Processed new email', { subject, from: fromEmail });
        }
      } catch (storageError) {
        logger.error('Storage error while processing email', { messageId, error: storageError });
      }
    } catch (error) {
      logger.error('Failed to process message', { messageId, error });
    }
  }

  private extractEmailBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
    if (!payload) return '';

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }

      // Fallback to HTML content
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return '';
  }

  private async analyzeEmailContext(subject: string, body: string, fromEmail: string): Promise<{
    context: 'notrom' | 'podcast' | 'day_job' | 'general';
    priority: 'low' | 'medium' | 'high';
    needsResponse: boolean;
    responseNeededBy: Date | null;
    suggestedResponse: string;
  }> {
    try {
      const prompt = `Analyze this email and provide JSON response:

Subject: ${subject}
From: ${fromEmail}
Body: ${body.slice(0, 1000)}...

Determine:
1. Context (notrom/podcast/day_job/general) based on:
   - notrom: web development, client work, freelance projects
   - podcast: Behind The Screens, guests, episodes, recording
   - day_job: Socially Powerful, talent management, HR, recruitment
   - general: personal, other topics

2. Priority (low/medium/high)
3. Whether it needs a response
4. When response is needed (1-3 days for business, 1 week for general)
5. Suggested professional response

Respond with JSON: {
  "context": "string",
  "priority": "string", 
  "needsResponse": boolean,
  "responseInDays": number,
  "suggestedResponse": "string"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      const responseNeededBy = analysis.needsResponse 
        ? new Date(Date.now() + (analysis.responseInDays || 3) * 24 * 60 * 60 * 1000)
        : null;

      return {
        context: analysis.context || 'general',
        priority: analysis.priority || 'medium',
        needsResponse: analysis.needsResponse || false,
        responseNeededBy,
        suggestedResponse: analysis.suggestedResponse || '',
      };
    } catch (error) {
      logger.error('Failed to analyze email context', error);
      return {
        context: 'general',
        priority: 'medium',
        needsResponse: true,
        responseNeededBy: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        suggestedResponse: 'Thank you for your email. I will review this and get back to you soon.',
      };
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body,
      ].join('\n');

      const encodedMessage = Buffer.from(message).toString('base64url');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      logger.info('Email sent successfully', { to, subject });
    } catch (error) {
      logger.error('Failed to send email', error);
      throw error;
    }
  }

  async getEmailsNeedingResponse(): Promise<any[]> {
    return await storage.getEmailsNeedingResponse();
  }

  async markEmailAsResponded(emailId: number): Promise<void> {
    await storage.markEmailAsResponded(emailId);
  }
}

export const gmailService = new GmailService();