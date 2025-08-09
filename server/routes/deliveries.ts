import { Router } from "express";
import { storage } from "../config/storage";
import { insertDeliverySchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";

const router = Router();

router.post("/", validateBody(insertDeliverySchema), async (req: any, res) => {
  try {
    const delivery = await storage.createDelivery(req.validatedBody);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "delivery", delivery.id, {
        clientName: delivery.clientName,
      });
    }
    res.status(201).json(delivery);
  } catch (error) {
    console.error("Create delivery error:", error);
    res.status(500).json({ message: "Failed to create delivery" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.clientId) filters.clientId = parseInt(req.query.clientId as string);
    const deliveries = await storage.getDeliveries(filters);
    res.json(deliveries);
  } catch (error) {
    console.error("Get deliveries error:", error);
    res.status(500).json({ message: "Failed to fetch deliveries" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const delivery = await storage.getDelivery(id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.json(delivery);
  } catch (error) {
    console.error("Get delivery error:", error);
    res.status(500).json({ message: "Failed to fetch delivery" });
  }
});

router.patch("/:id", validateBody(insertDeliverySchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const delivery = await storage.updateDelivery(id, req.validatedBody);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "delivery", delivery.id, {
        changes: req.validatedBody,
      });
    }
    res.json(delivery);
  } catch (error) {
    console.error("Update delivery error:", error);
    res.status(500).json({ message: "Failed to update delivery" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteDelivery(id);
    if (!success) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "delivery", id, {});
    }
    res.status(204).end();
  } catch (error) {
    console.error("Delete delivery error:", error);
    res.status(500).json({ message: "Failed to delete delivery" });
  }
});

export default router;
