import { Router } from "express";
import { storage } from "../config/storage";
import { insertTaskSchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";

const router = Router();

router.post("/", validateBody(insertTaskSchema), async (req: any, res) => {
  try {
    const task = await storage.createTask(req.validatedBody);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "task", task.id, {
        title: task.title,
      });
    }
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
    if (req.query.projectId) filters.projectId = parseInt(req.query.projectId as string);
    const tasks = await storage.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.get("/due-soon", async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const tasks = await storage.getTasksDueSoon(days);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch upcoming tasks" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const tags = await storage.getTagsByTask(id);
    res.json({ ...task, tags });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

router.patch("/:id", validateBody(insertTaskSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await storage.updateTask(id, req.validatedBody);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "task", task.id, {
        changes: req.validatedBody,
      });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTask(id);
    if (!success) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "task", id);
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

router.post("/:id/tags/:tagId", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    const task = await storage.getTask(taskId);
    const tag = await storage.getTag(tagId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    await storage.addTagToTask(taskId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to add tag to task" });
  }
});

router.delete("/:id/tags/:tagId", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    await storage.removeTagFromTask(taskId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to remove tag from task" });
  }
});

export default router;
