import { Router } from "express";
import { storage } from "../config/storage";
import { insertProjectSchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";
import * as aiService from "../services/ai";

const router = Router();

router.post("/", validateBody(insertProjectSchema), async (req: any, res) => {
  try {
    const project = await storage.createProject(req.validatedBody);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "project", project.id, {
        name: project.name,
      });
    }
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.leadId) filters.leadId = parseInt(req.query.leadId as string);
    if (req.query.clientId) filters.clientId = parseInt(req.query.clientId as string);
    const projects = await storage.getProjects(filters);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

router.get("/:id/blockers", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const tasks = await storage.getTasksByProject(id);
    const devPlan = await storage.getDevPlanByProject(id);
    const blockers = await aiService.analyzeProjectBlockers(project, tasks, devPlan);
    res.json(blockers);
  } catch (error) {
    console.error("Error analyzing project blockers:", error);
    res.status(500).json({ message: "Failed to analyze project blockers" });
  }
});

router.get("/:projectId/dev-plan", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const devPlan = await storage.getDevPlanByProject(projectId);
    if (!devPlan) {
      return res.status(404).json({ message: "No development plan found for this project" });
    }
    res.json(devPlan);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch development plan for project" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const tags = await storage.getTagsByProject(id);
    res.json({ ...project, tags });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

router.patch("/:id", validateBody(insertProjectSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const project = await storage.updateProject(id, req.validatedBody);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "project", project.id, {
        changes: req.validatedBody,
      });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProject(id);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "project", id);
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

router.post("/:id/tags/:tagId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    const project = await storage.getProject(projectId);
    const tag = await storage.getTag(tagId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    await storage.addTagToProject(projectId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to add tag to project" });
  }
});

router.delete("/:id/tags/:tagId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    await storage.removeTagFromProject(projectId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to remove tag from project" });
  }
});

export default router;
