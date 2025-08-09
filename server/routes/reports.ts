import { Router } from "express";
import { storage } from "../config/storage";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const reports = await storage.getReports();
    res.json(reports);
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

export default router;
