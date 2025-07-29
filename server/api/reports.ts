import { Router } from 'express';
import { storage } from '../config/storage';
import { reports, revenues } from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { reportService } from '../services/reportService';
import { logger } from '../utils/logger';

const router = Router();

// Generate talent report
router.post('/reports/talent', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const report = await reportService.generateTalentReport(
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json(report);
  } catch (error) {
    logger.error('Failed to generate talent report', error);
    res.status(500).json({ message: 'Failed to generate talent report' });
  }
});

// Generate podcast report
router.post('/reports/podcast', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const report = await reportService.generatePodcastReport(
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json(report);
  } catch (error) {
    logger.error('Failed to generate podcast report', error);
    res.status(500).json({ message: 'Failed to generate podcast report' });
  }
});

// Generate Notrom revenue report
router.post('/reports/notrom', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const report = await reportService.generateNotromRevenueReport(
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json(report);
  } catch (error) {
    logger.error('Failed to generate Notrom revenue report', error);
    res.status(500).json({ message: 'Failed to generate Notrom revenue report' });
  }
});

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const { context, limit = 10 } = req.query;
    
    const reports = await reportService.getReports(
      context as string,
      Number(limit)
    );
    
    res.json(reports);
  } catch (error) {
    logger.error('Failed to fetch reports', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Get revenue metrics
router.get('/revenue/metrics', async (req, res) => {
  try {
    const { context } = req.query;
    
    const metrics = await reportService.getRevenueMetrics(context as string);
    
    res.json(metrics);
  } catch (error) {
    logger.error('Failed to fetch revenue metrics', error);
    res.status(500).json({ message: 'Failed to fetch revenue metrics' });
  }
});

// Add revenue record
router.post('/revenue', async (req, res) => {
  try {
    const revenueData = req.body;
    
    // Convert amount to cents for storage
    if (revenueData.amount) {
      revenueData.amount = Math.round(revenueData.amount * 100);
    }
    
    const newRevenue = await storage.createRevenue(revenueData);
    
    res.json(newRevenue);
  } catch (error) {
    logger.error('Failed to add revenue record', error);
    res.status(500).json({ message: 'Failed to add revenue record' });
  }
});

// Get revenue records
router.get('/revenue', async (req, res) => {
  try {
    const { context, startDate, endDate, limit = 50 } = req.query;
    
    const revenues = await storage.getRevenues({ context, startDate, endDate, limit: Number(limit) });
    res.json(revenues);
  } catch (error) {
    logger.error('Failed to fetch revenue records', error);
    res.status(500).json({ message: 'Failed to fetch revenue records' });
  }
});

export default router;