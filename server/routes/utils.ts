import { z } from "zod";
import { storage } from "../config/storage";

export const validateBody = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid request body", errors: error });
  }
};

export const recordActivity = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: number,
  details?: any
) => {
  try {
    await storage.createActivity({
      userId,
      action,
      entityType,
      entityId,
      details: details || null,
    });
  } catch (error) {
    console.error("Failed to record activity:", error);
  }
};
