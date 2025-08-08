import { Router } from "express";
import { db } from "../config/db";
import { tasks, insertTaskSchema } from "@shared/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { logger } from "../utils/logger";

const router = Router();

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    res.json(allTasks);
  } catch (error) {
    logger.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Get tasks due soon
router.get("/due-soon", async (req, res) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const dueSoonTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "todo"),
          isNull(tasks.completedAt)
        )
      )
      .orderBy(tasks.dueDate);
    
    res.json(dueSoonTasks);
  } catch (error) {
    logger.error("Error fetching due soon tasks:", error);
    res.status(500).json({ message: "Failed to fetch due soon tasks" });
  }
});

// Get task by ID
router.get("/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    
    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task[0]);
  } catch (error) {
    logger.error("Error fetching task:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const validated = insertTaskSchema.parse(req.body);
    const [newTask] = await db.insert(tasks).values(validated).returning();
    res.status(201).json(newTask);
  } catch (error) {
    logger.error("Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Update task
router.patch("/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updates = req.body;
    
    // Set completedAt if status is being changed to completed
    if (updates.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }
    
    // Clear completedAt if status is being changed away from completed
    if (updates.status && updates.status !== 'completed') {
      updates.completedAt = null;
    }
    
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();
    
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(updatedTask);
  } catch (error) {
    logger.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    await db.delete(tasks).where(eq(tasks.id, taskId));
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting task:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;