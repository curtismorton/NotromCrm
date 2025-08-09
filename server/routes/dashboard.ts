import { Router } from "express";
import { storage } from "../config/storage";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

router.get("/recent-activities", async (_req, res) => {
  try {
    const activities = await storage.getRecentActivities(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recent activities" });
  }
});

router.get("/pipeline-stats", async (_req, res) => {
  try {
    const stats = await storage.getPipelineStats();
    res.json(stats);
  } catch (error) {
    console.error("Get pipeline stats error:", error);
    res.status(500).json({ message: "Failed to fetch pipeline stats" });
  }
});

export default router;
