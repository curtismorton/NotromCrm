import { Router } from "express";
import * as aiService from "../services/ai";

const router = Router();

router.post("/generate-task-suggestions", async (req, res) => {
  try {
    const { projectDescription, projectName } = req.body;
    if (!projectDescription || !projectName) {
      return res
        .status(400)
        .json({ message: "Project description and name are required" });
    }
    const suggestions = await aiService.generateTaskSuggestions(
      projectDescription,
      projectName
    );
    res.json(suggestions);
  } catch (error) {
    console.error("Error generating task suggestions:", error);
    res.status(500).json({ message: "Failed to generate task suggestions" });
  }
});

router.post("/process-task-update", async (req, res) => {
  try {
    const { taskId, currentStatus, update } = req.body;
    if (!taskId || !currentStatus || !update) {
      return res.status(400).json({
        message: "Task ID, current status, and update are required",
      });
    }
    const processed = await aiService.processNaturalLanguageUpdate(
      taskId,
      currentStatus,
      update
    );
    res.json(processed);
  } catch (error) {
    console.error("Error processing natural language update:", error);
    res.status(500).json({
      message: "Failed to process natural language update",
    });
  }
});

router.post("/client-insights", async (req, res) => {
  try {
    const { clientData } = req.body;
    if (!clientData) {
      return res.status(400).json({ message: "Client data is required" });
    }
    const insights = await aiService.generateClientInsights(clientData);
    res.json(insights);
  } catch (error) {
    console.error("Error generating client insights:", error);
    res
      .status(500)
      .json({ message: "Failed to generate client insights" });
  }
});

router.post("/search-prospective-clients", async (req, res) => {
  try {
    const { industry, criteria } = req.body;
    if (!industry || !criteria) {
      return res
        .status(400)
        .json({ message: "Industry and criteria are required" });
    }
    const prospects = await aiService.searchProspectiveClients(
      industry,
      criteria
    );
    res.json(prospects);
  } catch (error) {
    console.error("Error searching for prospective clients:", error);
    res
      .status(500)
      .json({ message: "Failed to search for prospective clients" });
  }
});

router.post("/dashboard-insights", async (req, res) => {
  try {
    if (!req.body || !req.body.contextInfo) {
      return res
        .status(400)
        .json({ message: "Context information is required" });
    }
    const insights = await aiService.generateDashboardInsights(req.body);
    res.json(insights);
  } catch (error) {
    console.error("Error generating dashboard insights:", error);
    res
      .status(500)
      .json({ message: "Failed to generate dashboard insights" });
  }
});

router.post("/task-advice", async (req, res) => {
  try {
    const { taskDescription, taskStatus } = req.body;
    if (!taskDescription || !taskStatus) {
      return res.status(400).json({
        message: "Task description and status are required",
      });
    }
    const advice = await aiService.getTaskAdvice(taskDescription, taskStatus);
    res.json(advice);
  } catch (error) {
    console.error("Error getting task advice:", error);
    res.status(500).json({ message: "Failed to get task advice" });
  }
});

export default router;
