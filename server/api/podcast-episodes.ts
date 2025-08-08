import { Router } from "express";
import { db } from "../config/db";
import { podcastEpisodes } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = Router();

const episodeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  episodeNumber: z.number().optional(),
  status: z.enum(["planning", "recorded", "editing", "published"]).default("planning"),
  publishDate: z.string().optional(),
  duration: z.number().optional(),
  topics: z.array(z.string()).default([]),
  guests: z.array(z.string()).default([]),
  notes: z.string().optional(),
  youtubeUrl: z.string().optional(),
  spotifyUrl: z.string().optional(),
});

// Get all episodes
router.get("/", async (req, res) => {
  try {
    const episodes = await db.select().from(podcastEpisodes).orderBy(desc(podcastEpisodes.createdAt));
    res.json(episodes);
  } catch (error) {
    logger.error("Error fetching episodes:", error);
    res.status(500).json({ message: "Failed to fetch episodes" });
  }
});

// Create new episode
router.post("/", async (req, res) => {
  try {
    const validated = episodeSchema.parse(req.body);
    const [newEpisode] = await db.insert(podcastEpisodes).values({
      ...validated,
      publishDate: validated.publishDate ? new Date(validated.publishDate) : null,
    }).returning();
    res.status(201).json(newEpisode);
  } catch (error) {
    logger.error("Error creating episode:", error);
    res.status(500).json({ message: "Failed to create episode" });
  }
});

// Update episode
router.patch("/:id", async (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    const updates = req.body;
    
    const [updatedEpisode] = await db
      .update(podcastEpisodes)
      .set(updates)
      .where(eq(podcastEpisodes.id, episodeId))
      .returning();
    
    if (!updatedEpisode) {
      return res.status(404).json({ message: "Episode not found" });
    }
    
    res.json(updatedEpisode);
  } catch (error) {
    logger.error("Error updating episode:", error);
    res.status(500).json({ message: "Failed to update episode" });
  }
});

export default router;