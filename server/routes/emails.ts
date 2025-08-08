import { Router } from "express";
import { storage } from "../config/storage";
import { GmailService } from "../services/gmailService";

const router = Router();
const gmailService = new GmailService();

router.get("/gmail/status", async (_req, res) => {
  try {
    const status = await gmailService.getConnectionStatus();
    res.json(status);
  } catch (error) {
    console.error("Gmail status error:", error);
    res.json({ connected: false, errorMessage: "Unable to check Gmail connection" });
  }
});

router.get("/gmail/auth", async (_req, res) => {
  try {
    const authUrl = await gmailService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error("Gmail auth error:", error);
    res.status(500).json({ message: "Failed to generate auth URL" });
  }
});

router.get("/gmail/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: "Authorization code required" });
    }
    await gmailService.handleAuthCallback(code as string);
    res.redirect("/dashboard?gmail=connected");
  } catch (error) {
    console.error("Gmail callback error:", error);
    res.status(500).json({ message: "Failed to handle auth callback" });
  }
});

router.post("/gmail/sync", async (_req, res) => {
  try {
    await gmailService.syncEmails();
    res.json({ message: "Email sync completed" });
  } catch (error) {
    console.error("Gmail sync error:", error);
    res.status(500).json({ message: "Failed to sync emails" });
  }
});

router.get("/emails", async (_req, res) => {
  try {
    const emails = await storage.getEmails();
    res.json(emails);
  } catch (error) {
    console.error("Get emails error:", error);
    res.status(500).json({ message: "Failed to fetch emails" });
  }
});

router.get("/emails/stats", async (_req, res) => {
  try {
    const stats = await storage.getEmailStats();
    res.json(stats);
  } catch (error) {
    console.error("Get email stats error:", error);
    res.status(500).json({ message: "Failed to fetch email stats" });
  }
});

router.get("/emails/needs-response", async (_req, res) => {
  try {
    const emails = await storage.getEmailsNeedingResponse();
    res.json(emails);
  } catch (error) {
    console.error("Get emails needing response error:", error);
    res.status(500).json({ message: "Failed to fetch emails needing response" });
  }
});

export default router;
