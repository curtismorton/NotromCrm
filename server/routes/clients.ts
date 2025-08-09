import { Router } from "express";
import { storage } from "../config/storage";
import { insertClientSchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";

const router = Router();

router.post("/", validateBody(insertClientSchema), async (req: any, res) => {
  try {
    const client = await storage.createClient(req.validatedBody);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "client", client.id, {
        companyName: client.companyName,
      });
    }
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: "Failed to create client" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.industry) filters.industry = req.query.industry;
    if (req.query.upsellOpportunity)
      filters.upsellOpportunity = req.query.upsellOpportunity === "true";
    const clients = await storage.getClients(filters);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const term = req.query.term as string;
    if (!term) {
      return res.status(400).json({ message: "Search term is required" });
    }
    const clients = await storage.searchClients(term);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to search clients" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const tags = await storage.getTagsByClient(id);
    const projects = await storage.getProjectsByClient(id);
    res.json({ ...client, tags, projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client" });
  }
});

router.patch("/:id", validateBody(insertClientSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const client = await storage.updateClient(id, req.validatedBody);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "client", client.id, {
        changes: req.validatedBody,
      });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Failed to update client" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteClient(id);
    if (!success) {
      return res.status(404).json({ message: "Client not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "client", id);
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete client" });
  }
});

router.post("/:id/tags/:tagId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    const client = await storage.getClient(clientId);
    const tag = await storage.getTag(tagId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    await storage.addTagToClient(clientId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to add tag to client" });
  }
});

router.delete("/:id/tags/:tagId", async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    await storage.removeTagFromClient(clientId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to remove tag from client" });
  }
});

export default router;
