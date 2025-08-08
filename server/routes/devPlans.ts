import { Router } from "express";
import { storage } from "../config/storage";
import { insertDevPlanSchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";

const router = Router();

router.post("/", validateBody(insertDevPlanSchema), async (req: any, res) => {
  try {
    const devPlan = await storage.createDevPlan(req.validatedBody);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "dev_plan", devPlan.id, {
        name: devPlan.name,
        projectId: devPlan.projectId,
      });
    }
    res.status(201).json(devPlan);
  } catch (error) {
    res.status(500).json({ message: "Failed to create development plan" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.currentStage) filters.currentStage = req.query.currentStage;
    if (req.query.projectId) filters.projectId = parseInt(req.query.projectId as string);
    const devPlans = await storage.getDevPlans(filters);
    res.json(devPlans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch development plans" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const devPlan = await storage.getDevPlan(id);
    if (!devPlan) {
      return res.status(404).json({ message: "Development plan not found" });
    }
    res.json(devPlan);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch development plan" });
  }
});

router.patch("/:id", validateBody(insertDevPlanSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const devPlan = await storage.updateDevPlan(id, req.validatedBody);
    if (!devPlan) {
      return res.status(404).json({ message: "Development plan not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "dev_plan", devPlan.id, {
        changes: req.validatedBody,
      });
    }
    res.json(devPlan);
  } catch (error) {
    res.status(500).json({ message: "Failed to update development plan" });
  }
});

router.patch("/:id/stage", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { stage, startDate, endDate } = req.body;
    if (!stage) {
      return res.status(400).json({ message: "Stage is required" });
    }
    const validStages = ["planning", "build", "revise", "live"];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage value" });
    }
    const devPlan = await storage.updateDevPlanStage(
      id,
      stage,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    if (!devPlan) {
      return res.status(404).json({ message: "Development plan not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update_stage", "dev_plan", devPlan.id, {
        stage,
        startDate,
        endDate,
      });
    }
    res.json(devPlan);
  } catch (error) {
    res.status(500).json({ message: "Failed to update development plan stage" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteDevPlan(id);
    if (!success) {
      return res.status(404).json({ message: "Development plan not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "dev_plan", id, {});
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete development plan" });
  }
});

export default router;
