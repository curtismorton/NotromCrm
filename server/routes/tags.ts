import { Router } from "express";
import { storage } from "../config/storage";
import { insertTagSchema } from "@shared/schema";
import { validateBody } from "./utils";

const router = Router();

router.post("/", validateBody(insertTagSchema), async (req: any, res) => {
  try {
    const tag = await storage.createTag(req.validatedBody);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Failed to create tag" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const tags = await storage.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags" });
  }
});

router.patch("/:id", validateBody(insertTagSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const tag = await storage.updateTag(id, req.validatedBody);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tag" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTag(id);
    if (!success) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tag" });
  }
});

export default router;
