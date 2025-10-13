import { google } from 'googleapis';
import { triageEmail } from './ai';
import { logger } from '../utils/logger';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!hostname) {
    logger.error('REPLIT_CONNECTORS_HOSTNAME not found');
    throw new Error('REPLIT_CONNECTORS_HOSTNAME not found');
  }

  if (!xReplitToken) {
    logger.error('X_REPLIT_TOKEN not found for repl/depl');
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const url = 'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail';
  logger.info('Fetching Gmail connection', { url, hasToken: !!xReplitToken });

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Failed to fetch connection', { status: response.status, error: errorText });
    throw new Error(`Failed to fetch connection: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.error('=== Gmail Connection Debug ===');
  console.error('Full response:', JSON.stringify(data, null, 2));
  console.error('Items count:', data.items?.length);
  console.error('First item:', JSON.stringify(data.items?.[0], null, 2));

  connectionSettings = data.items?.[0];

  if (!connectionSettings) {
    console.error('ERROR: No connection settings found');
    throw new Error('Gmail connection not found. Please set up Gmail in the Replit connections panel.');
  }

  console.error('Connection settings:', JSON.stringify(connectionSettings, null, 2));
  
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    console.error('ERROR: No access token found');
    console.error('Settings keys:', connectionSettings?.settings ? Object.keys(connectionSettings.settings) : 'no settings');
    throw new Error('Gmail access token not found. Please reconnect Gmail in the integrations panel.');
  }

  console.error('Successfully got access token');
  console.error('=== End Debug ===');
  
  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export interface TriagedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  suggestedAction: 'reply' | 'review' | 'archive' | 'task';
  aiSummary: string;
  aiKeyPoints: string[];
  extractedData: {
    campaignName?: string;
    deliverableName?: string;
    dueDate?: string;
    talentName?: string;
  };
}

function parseEmailAddress(emailString: string): { name: string; email: string } {
  const match = emailString.match(/^(.+?)\s*<(.+?)>$/) || [null, emailString, emailString];
  return {
    name: match[1]?.trim() || '',
    email: match[2]?.trim() || emailString
  };
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

function extractEmailBody(payload: any): string {
  if (!payload) return '';

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }

    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
  }

  return '';
}

export class GmailService {
  async fetchAndTriageEmails(maxResults: number = 50): Promise<TriagedEmail[]> {
    try {
      const gmail = await getUncachableGmailClient();
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox',
      });

      const messages = response.data.messages ?? [];
      const triagedEmails: TriagedEmail[] = [];

      for (const message of messages) {
        if (message.id) {
          try {
            const fullMessage = await gmail.users.messages.get({
              userId: 'me',
              id: message.id,
              format: 'full',
            });

            const payload = fullMessage.data.payload;
            const headers = payload?.headers ?? [];
            
            const subject = headers.find((h) => h.name === 'Subject')?.value || '';
            const fromHeader = headers.find((h) => h.name === 'From')?.value || '';
            const dateHeader = headers.find((h) => h.name === 'Date')?.value || '';
            
            const { name: fromName, email: fromEmail } = parseEmailAddress(fromHeader);
            const body = extractEmailBody(payload);
            const snippet = fullMessage.data.snippet || '';
            const labelIds = fullMessage.data.labelIds || [];
            const isUnread = labelIds.includes('UNREAD');

            const aiTriage = await triageEmail(subject, body, fromEmail);

            triagedEmails.push({
              id: message.id,
              threadId: fullMessage.data.threadId || '',
              subject,
              from: fromName || fromEmail,
              fromEmail,
              snippet,
              body,
              date: dateHeader,
              unread: isUnread,
              priority: aiTriage.priority,
              suggestedAction: aiTriage.suggestedAction,
              aiSummary: aiTriage.summary,
              aiKeyPoints: aiTriage.keyPoints || [],
              extractedData: aiTriage.extractedData || {},
            });

            logger.info('Triaged email', { id: message.id, subject, priority: aiTriage.priority });
          } catch (error) {
            logger.error('Failed to process message', { messageId: message.id, error });
          }
        }
      }

      logger.info(`Fetched and triaged ${triagedEmails.length} emails`);
      return triagedEmails;
    } catch (error) {
      logger.error('Failed to fetch and triage emails', error);
      throw error;
    }
  }

  async sendEmailReply(messageId: string, replyText: string): Promise<void> {
    try {
      const gmail = await getUncachableGmailClient();

      const originalMessage = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const headers = originalMessage.data.payload?.headers ?? [];
      const subject = headers.find((h) => h.name === 'Subject')?.value || '';
      const to = headers.find((h) => h.name === 'From')?.value || '';
      const messageIdHeader = headers.find((h) => h.name === 'Message-ID')?.value || '';

      const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

      const message = [
        `To: ${to}`,
        `Subject: ${replySubject}`,
        `In-Reply-To: ${messageIdHeader}`,
        `References: ${messageIdHeader}`,
        '',
        replyText,
      ].join('\n');

      const encodedMessage = Buffer.from(message).toString('base64url');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: originalMessage.data.threadId,
        },
      });

      logger.info('Reply sent successfully', { messageId, to });
    } catch (error) {
      logger.error('Failed to send reply', { messageId, error });
      throw error;
    }
  }

  async markEmailAsRead(messageId: string): Promise<void> {
    try {
      const gmail = await getUncachableGmailClient();

      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });

      logger.info('Marked email as read', { messageId });
    } catch (error) {
      logger.error('Failed to mark email as read', { messageId, error });
      throw error;
    }
  }
}

export const gmailService = new GmailService();
