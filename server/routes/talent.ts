import { Router } from "express";
import { storage } from "../config/storage";
import { insertTalentSchema, insertBrandSchema, insertCampaignSchema, insertDeliverableSchema, insertInvoiceSchema, insertContractSchema, insertTouchpointSchema } from "@shared/schema";

const router = Router();

// Talent endpoints
router.post("/api/talent", async (req, res) => {
  try {
    const talent = await storage.createTalent(req.body);
    res.status(201).json(talent);
  } catch (error) {
    console.error("Create talent error:", error);
    res.status(500).json({ message: "Failed to create talent" });
  }
});

router.get("/api/talent", async (req, res) => {
  try {
    const talent = await storage.getTalents(req.query);
    res.json(talent);
  } catch (error) {
    console.error("Get talent error:", error);
    res.status(500).json({ message: "Failed to get talent" });
  }
});

// Stats endpoint must come before :id route
router.get("/api/talent/stats", async (req, res) => {
  try {
    const stats = await storage.getTalentStats();
    res.json(stats);
  } catch (error) {
    console.error("Get talent stats error:", error);
    res.status(500).json({ message: "Failed to get talent stats" });
  }
});

router.get("/api/talent/:id", async (req, res) => {
  try {
    const talent = await storage.getTalent(parseInt(req.params.id));
    if (!talent) {
      return res.status(404).json({ message: "Talent not found" });
    }
    res.json(talent);
  } catch (error) {
    console.error("Get talent error:", error);
    res.status(500).json({ message: "Failed to get talent" });
  }
});

router.patch("/api/talent/:id", async (req, res) => {
  try {
    const talent = await storage.updateTalent(parseInt(req.params.id), req.body);
    if (!talent) {
      return res.status(404).json({ message: "Talent not found" });
    }
    res.json(talent);
  } catch (error) {
    console.error("Update talent error:", error);
    res.status(500).json({ message: "Failed to update talent" });
  }
});

router.delete("/api/talent/:id", async (req, res) => {
  try {
    await storage.deleteTalent(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error("Delete talent error:", error);
    res.status(500).json({ message: "Failed to delete talent" });
  }
});

// Brand endpoints
router.post("/api/brands", async (req, res) => {
  try {
    const brand = await storage.createBrand(req.body);
    res.status(201).json(brand);
  } catch (error) {
    console.error("Create brand error:", error);
    res.status(500).json({ message: "Failed to create brand" });
  }
});

router.get("/api/brands", async (req, res) => {
  try {
    const brands = await storage.getBrands(req.query);
    res.json(brands);
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ message: "Failed to get brands" });
  }
});

// Campaign endpoints
router.post("/api/campaigns", async (req, res) => {
  try {
    const campaign = await storage.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ message: "Failed to create campaign" });
  }
});

router.get("/api/campaigns", async (req, res) => {
  try {
    const campaigns = await storage.getCampaigns(req.query);
    res.json(campaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ message: "Failed to get campaigns" });
  }
});

router.get("/api/campaigns/:id", async (req, res) => {
  try {
    const campaign = await storage.getCampaign(parseInt(req.params.id));
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ message: "Failed to get campaign" });
  }
});

router.patch("/api/campaigns/:id", async (req, res) => {
  try {
    const campaign = await storage.updateCampaign(parseInt(req.params.id), req.body);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ message: "Failed to update campaign" });
  }
});

// Deliverables endpoints
router.post("/api/deliverables", async (req, res) => {
  try {
    const deliverable = await storage.createDeliverable(req.body);
    res.status(201).json(deliverable);
  } catch (error) {
    console.error("Create deliverable error:", error);
    res.status(500).json({ message: "Failed to create deliverable" });
  }
});

router.get("/api/deliverables", async (req, res) => {
  try {
    const deliverables = await storage.getDeliverables(req.query);
    res.json(deliverables);
  } catch (error) {
    console.error("Get deliverables error:", error);
    res.status(500).json({ message: "Failed to get deliverables" });
  }
});

router.patch("/api/deliverables/:id", async (req, res) => {
  try {
    const deliverable = await storage.updateDeliverable(parseInt(req.params.id), req.body);
    if (!deliverable) {
      return res.status(404).json({ message: "Deliverable not found" });
    }
    res.json(deliverable);
  } catch (error) {
    console.error("Update deliverable error:", error);
    res.status(500).json({ message: "Failed to update deliverable" });
  }
});

// Invoice endpoints
router.post("/api/invoices", async (req, res) => {
  try {
    const invoice = await storage.createInvoice(req.body);
    res.status(201).json(invoice);
    } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
});

router.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await storage.getInvoices(req.query);
    res.json(invoices);
  } catch (error) {
    console.error("Get invoices error:", error);
    res.status(500).json({ message: "Failed to get invoices" });
  }
});

router.patch("/api/invoices/:id", async (req, res) => {
  try {
    const invoice = await storage.updateInvoice(parseInt(req.params.id), req.body);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ message: "Failed to update invoice" });
  }
});

// Contract endpoints
router.post("/api/contracts", async (req, res) => {
  try {
    const contract = await storage.createContract(req.body);
    res.status(201).json(contract);
  } catch (error) {
    console.error("Create contract error:", error);
    res.status(500).json({ message: "Failed to create contract" });
  }
});

router.get("/api/contracts", async (req, res) => {
  try {
    const contracts = await storage.getContracts(req.query);
    res.json(contracts);
  } catch (error) {
    console.error("Get contracts error:", error);
    res.status(500).json({ message: "Failed to get contracts" });
  }
});

// Touchpoint endpoints
router.post("/api/touchpoints", async (req, res) => {
  try {
    const touchpoint = await storage.createTouchpoint(req.body);
    res.status(201).json(touchpoint);
  } catch (error) {
    console.error("Create touchpoint error:", error);
    res.status(500).json({ message: "Failed to create touchpoint" });
  }
});

router.get("/api/touchpoints", async (req, res) => {
  try {
    const touchpoints = await storage.getTouchpoints(req.query);
    res.json(touchpoints);
  } catch (error) {
    console.error("Get touchpoints error:", error);
    res.status(500).json({ message: "Failed to get touchpoints" });
  }
});

export default router;
