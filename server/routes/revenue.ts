import { Router } from "express";
import { storage } from "../config/storage";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const revenues = await storage.getRevenues();
    res.json(revenues);
  } catch (error) {
    console.error("Get revenues error:", error);
    res.status(500).json({ message: "Failed to fetch revenues" });
  }
});

router.get("/metrics", async (_req, res) => {
  try {
    const metrics = await storage.getRevenueMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("Get revenue metrics error:", error);
    res.status(500).json({ message: "Failed to fetch revenue metrics" });
  }
});

export default router;
