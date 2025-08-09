import { Router } from "express";
import { storage } from "../config/storage";
import { insertAutomationSchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";

const router = Router();

router.post("/", validateBody(insertAutomationSchema), async (req: any, res) => {
  try {
    const automation = await storage.createAutomation(req.validatedBody);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "automation", automation.id, {
        name: automation.name,
      });
    }
    res.status(201).json(automation);
  } catch (error) {
    console.error("Create automation error:", error);
    res.status(500).json({ message: "Failed to create automation" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.tool) filters.tool = req.query.tool;
    if (req.query.isActive !== undefined)
      filters.isActive = req.query.isActive === "true";
    const automations = await storage.getAutomations(filters);
    res.json(automations);
  } catch (error) {
    console.error("Get automations error:", error);
    res.status(500).json({ message: "Failed to fetch automations" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const automation = await storage.getAutomation(id);
    if (!automation) {
      return res.status(404).json({ message: "Automation not found" });
    }
    res.json(automation);
  } catch (error) {
    console.error("Get automation error:", error);
    res.status(500).json({ message: "Failed to fetch automation" });
  }
});

router.patch("/:id", validateBody(insertAutomationSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const automation = await storage.updateAutomation(id, req.validatedBody);
    if (!automation) {
      return res.status(404).json({ message: "Automation not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "automation", automation.id, {
        changes: req.validatedBody,
      });
    }
    res.json(automation);
  } catch (error) {
    console.error("Update automation error:", error);
    res.status(500).json({ message: "Failed to update automation" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteAutomation(id);
    if (!success) {
      return res.status(404).json({ message: "Automation not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "automation", id, {});
    }
    res.status(204).end();
  } catch (error) {
    console.error("Delete automation error:", error);
    res.status(500).json({ message: "Failed to delete automation" });
  }
});

export default router;
