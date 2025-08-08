import { Router } from "express";
import { storage } from "../config/storage";
import { insertLeadSchema } from "@shared/schema";
import { validateBody, recordActivity } from "./utils";

const router = Router();

router.post("/", validateBody(insertLeadSchema), async (req: any, res) => {
  try {
    const lead = await storage.createLead(req.validatedBody);

    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "create", "lead", lead.id, {
        companyName: lead.companyName,
      });
    }

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Failed to create lead" });
  }
});

router.get("/", async (req, res) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
    const leads = await storage.getLeads(filters);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const term = req.query.term as string;
    if (!term) {
      return res.status(400).json({ message: "Search term is required" });
    }
    const leads = await storage.searchLeads(term);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to search leads" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const lead = await storage.getLead(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    const tags = await storage.getTagsByLead(id);
    res.json({ ...lead, tags });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lead" });
  }
});

router.patch("/:id", validateBody(insertLeadSchema.partial()), async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const lead = await storage.updateLead(id, req.validatedBody);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "update", "lead", lead.id, {
        changes: req.validatedBody,
      });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lead" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteLead(id);
    if (!success) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "delete", "lead", id);
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lead" });
  }
});

router.post("/:id/tags/:tagId", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    const lead = await storage.getLead(leadId);
    const tag = await storage.getTag(tagId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    await storage.addTagToLead(leadId, tagId);
    if (req.user?.claims?.sub) {
      await recordActivity(req.user.claims.sub, "tag", "lead", leadId, {
        tagId,
        tagName: tag.name,
      });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to add tag to lead" });
  }
});

router.delete("/:id/tags/:tagId", async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const tagId = parseInt(req.params.tagId);
    await storage.removeTagFromLead(leadId, tagId);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Failed to remove tag from lead" });
  }
});

export default router;
