import { Router } from 'express';
import { storage } from '../config/storage';
import { emails } from '@shared/schema';
import { eq, desc, and, isNull, isNotNull } from 'drizzle-orm';
import { gmailService } from '../services/gmailService';
import { logger } from '../utils/logger';

const router = Router();

// Get emails needing response
router.get('/emails/needs-response', async (req, res) => {
  try {
    const emailsNeedingResponse = await storage.getEmailsNeedingResponse();
    
    res.json(emailsNeedingResponse);
  } catch (error) {
    logger.error('Failed to fetch emails needing response', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
});

// Get all emails with filters
router.get('/emails', async (req, res) => {
  try {
    const { context, status, limit = 50 } = req.query;
    const emails = await storage.getEmails({ context, status, limit: Number(limit) });
    res.json(emails);
  } catch (error) {
    logger.error('Failed to fetch emails', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
});

// Sync emails from Gmail
router.post('/emails/sync', async (req, res) => {
  try {
    await gmailService.syncEmails(50);
    res.json({ message: 'Email sync completed successfully' });
  } catch (error) {
    logger.error('Failed to sync emails', error);
    res.status(500).json({ message: 'Failed to sync emails' });
  }
});

// Get Gmail auth URL
router.get('/gmail/auth-url', async (req, res) => {
  try {
    const authUrl = await gmailService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    logger.error('Failed to get Gmail auth URL', error);
    res.status(500).json({ message: 'Failed to get auth URL' });
  }
});

// Handle Gmail OAuth callback
router.post('/gmail/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }
    
    const tokens = await gmailService.handleAuthCallback(code);
    res.json({ message: 'Gmail integration successful', tokens });
  } catch (error) {
    logger.error('Failed to handle Gmail callback', error);
    res.status(500).json({ message: 'Failed to authenticate with Gmail' });
  }
});

// Send email
router.post('/emails/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ message: 'To, subject, and body are required' });
    }
    
    await gmailService.sendEmail(to, subject, body);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    logger.error('Failed to send email', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Mark email as responded
router.patch('/emails/:id/responded', async (req, res) => {
  try {
    const emailId = parseInt(req.params.id);
    await gmailService.markEmailAsResponded(emailId);
    res.json({ message: 'Email marked as responded' });
  } catch (error) {
    logger.error('Failed to mark email as responded', error);
    res.status(500).json({ message: 'Failed to update email' });
  }
});

// Get email stats
router.get('/emails/stats', async (req, res) => {
  try {
    const stats = await storage.getEmailStats();
    res.json(stats);
  } catch (error) {
    logger.error('Failed to fetch email stats', error);
    res.status(500).json({ message: 'Failed to fetch email stats' });
  }
});

export default router;