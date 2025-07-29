import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../config/storage";
import { z } from "zod";
import { 
  insertLeadSchema, 
  insertProjectSchema, 
  insertClientSchema, 
  insertTaskSchema, 
  insertTagSchema,
  insertActivitySchema,
  insertDevPlanSchema
} from "@shared/schema";
import * as aiService from "../services/ai";
import { GmailService } from "../services/gmailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Gmail service
  const gmailService = new GmailService();

  // Helper for validating request bodies
  const validateBody = (schema: z.ZodSchema) => (req: any, res: any, next: any) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid request body", errors: error });
    }
  };

  // Helper for recording activities
  const recordActivity = async (userId: string, action: string, entityType: string, entityId: number, details?: any) => {
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

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/recent-activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(10);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  // Leads
  app.post("/api/leads", validateBody(insertLeadSchema), async (req, res) => {
    try {
      const lead = await storage.createLead(req.validatedBody);
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "create",
          "lead",
          lead.id,
          { companyName: lead.companyName }
        );
      }
      
      res.status(201).json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const filters: any = {};
      
      // Apply filters from query params
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priority) filters.priority = req.query.priority;
      if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
      
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/search", async (req, res) => {
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

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Get tags for this lead
      const tags = await storage.getTagsByLead(id);
      
      res.json({ ...lead, tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.patch("/api/leads/:id", validateBody(insertLeadSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.updateLead(id, req.validatedBody);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "update",
          "lead",
          lead.id,
          { changes: req.validatedBody }
        );
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "delete",
          "lead",
          id
        );
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });
  
  // Lead tags
  app.post("/api/leads/:id/tags/:tagId", async (req, res) => {
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
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "tag",
          "lead",
          leadId,
          { tagId, tagName: tag.name }
        );
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag to lead" });
    }
  });
  
  app.delete("/api/leads/:id/tags/:tagId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const tagId = parseInt(req.params.tagId);
      
      await storage.removeTagFromLead(leadId, tagId);
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from lead" });
    }
  });

  // Projects
  app.post("/api/projects", validateBody(insertProjectSchema), async (req, res) => {
    try {
      const project = await storage.createProject(req.validatedBody);
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "create",
          "project",
          project.id,
          { name: project.name }
        );
      }
      
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const filters: any = {};
      
      // Apply filters from query params
      if (req.query.status) filters.status = req.query.status;
      if (req.query.leadId) filters.leadId = parseInt(req.query.leadId as string);
      if (req.query.clientId) filters.clientId = parseInt(req.query.clientId as string);
      
      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get tags for this project
      const tags = await storage.getTagsByProject(id);
      
      res.json({ ...project, tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get("/api/projects/:id/blockers", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get tasks for this project
      const tasks = await storage.getTasksByProject(id);
      
      // Get dev plan for this project (if exists)
      const devPlan = await storage.getDevPlanByProject(id);
      
      // Analyze project for blockers using AI
      const blockers = await aiService.analyzeProjectBlockers(project, tasks, devPlan);
      
      res.json(blockers);
    } catch (error) {
      console.error("Error analyzing project blockers:", error);
      res.status(500).json({ message: "Failed to analyze project blockers" });
    }
  });

  app.patch("/api/projects/:id", validateBody(insertProjectSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.updateProject(id, req.validatedBody);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "update",
          "project",
          project.id,
          { changes: req.validatedBody }
        );
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "delete",
          "project",
          id
        );
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // Project tags
  app.post("/api/projects/:id/tags/:tagId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const tagId = parseInt(req.params.tagId);
      
      const project = await storage.getProject(projectId);
      const tag = await storage.getTag(tagId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      await storage.addTagToProject(projectId, tagId);
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag to project" });
    }
  });
  
  app.delete("/api/projects/:id/tags/:tagId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const tagId = parseInt(req.params.tagId);
      
      await storage.removeTagFromProject(projectId, tagId);
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from project" });
    }
  });

  // Clients
  app.post("/api/clients", validateBody(insertClientSchema), async (req, res) => {
    try {
      const client = await storage.createClient(req.validatedBody);
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "create",
          "client",
          client.id,
          { companyName: client.companyName }
        );
      }
      
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.get("/api/clients", async (req, res) => {
    try {
      const filters: any = {};
      
      // Apply filters from query params
      if (req.query.industry) filters.industry = req.query.industry;
      if (req.query.upsellOpportunity) filters.upsellOpportunity = req.query.upsellOpportunity === 'true';
      
      const clients = await storage.getClients(filters);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/search", async (req, res) => {
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

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Get tags for this client
      const tags = await storage.getTagsByClient(id);
      
      // Get projects for this client
      const projects = await storage.getProjectsByClient(id);
      
      res.json({ ...client, tags, projects });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.patch("/api/clients/:id", validateBody(insertClientSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.updateClient(id, req.validatedBody);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "update",
          "client",
          client.id,
          { changes: req.validatedBody }
        );
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "delete",
          "client",
          id
        );
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });
  
  // Client tags
  app.post("/api/clients/:id/tags/:tagId", async (req, res) => {
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
  
  app.delete("/api/clients/:id/tags/:tagId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const tagId = parseInt(req.params.tagId);
      
      await storage.removeTagFromClient(clientId, tagId);
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from client" });
    }
  });

  // Tasks
  app.post("/api/tasks", validateBody(insertTaskSchema), async (req, res) => {
    try {
      const task = await storage.createTask(req.validatedBody);
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "create",
          "task",
          task.id,
          { title: task.title }
        );
      }
      
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const filters: any = {};
      
      // Apply filters from query params
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

  app.get("/api/tasks/due-soon", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const tasks = await storage.getTasksDueSoon(days);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get tags for this task
      const tags = await storage.getTagsByTask(id);
      
      res.json({ ...task, tags });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.patch("/api/tasks/:id", validateBody(insertTaskSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.validatedBody);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "update",
          "task",
          task.id,
          { changes: req.validatedBody }
        );
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "delete",
          "task",
          id
        );
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Task tags
  app.post("/api/tasks/:id/tags/:tagId", async (req, res) => {
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
  
  app.delete("/api/tasks/:id/tags/:tagId", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const tagId = parseInt(req.params.tagId);
      
      await storage.removeTagFromTask(taskId, tagId);
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove tag from task" });
    }
  });

  // Dev Plans
  app.post("/api/dev-plans", validateBody(insertDevPlanSchema), async (req, res) => {
    try {
      const devPlan = await storage.createDevPlan(req.validatedBody);
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "create",
          "dev_plan",
          devPlan.id,
          { name: devPlan.name, projectId: devPlan.projectId }
        );
      }
      
      res.status(201).json(devPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create development plan" });
    }
  });

  app.get("/api/dev-plans", async (req, res) => {
    try {
      const filters: any = {};
      
      // Apply filters from query params
      if (req.query.currentStage) filters.currentStage = req.query.currentStage;
      if (req.query.projectId) filters.projectId = parseInt(req.query.projectId as string);
      
      const devPlans = await storage.getDevPlans(filters);
      res.json(devPlans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch development plans" });
    }
  });

  app.get("/api/dev-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const devPlan = await storage.getDevPlan(id);
      
      if (!devPlan) {
        return res.status(404).json({ message: "Development plan not found" });
      }
      
      res.json(devPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch development plan" });
    }
  });

  app.get("/api/projects/:projectId/dev-plan", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const devPlan = await storage.getDevPlanByProject(projectId);
      
      if (!devPlan) {
        return res.status(404).json({ message: "No development plan found for this project" });
      }
      
      res.json(devPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch development plan for project" });
    }
  });

  app.patch("/api/dev-plans/:id", validateBody(insertDevPlanSchema.partial()), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const devPlan = await storage.updateDevPlan(id, req.validatedBody);
      
      if (!devPlan) {
        return res.status(404).json({ message: "Development plan not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "update",
          "dev_plan",
          devPlan.id,
          { changes: req.validatedBody }
        );
      }
      
      res.json(devPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update development plan" });
    }
  });

  app.patch("/api/dev-plans/:id/stage", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { stage, startDate, endDate } = req.body;
      
      if (!stage) {
        return res.status(400).json({ message: "Stage is required" });
      }
      
      const validStages = ["planning", "build", "revise", "live"];
      if (!validStages.includes(stage)) {
        return res.status(400).json({ message: "Invalid stage value" });
      }
      
      const devPlan = await storage.updateDevPlanStage(
        id, 
        stage, 
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      
      if (!devPlan) {
        return res.status(404).json({ message: "Development plan not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "update_stage",
          "dev_plan",
          devPlan.id,
          { stage, startDate, endDate }
        );
      }
      
      res.json(devPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update development plan stage" });
    }
  });

  app.delete("/api/dev-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDevPlan(id);
      
      if (!success) {
        return res.status(404).json({ message: "Development plan not found" });
      }
      
      // Record activity
      if (req.user?.claims?.sub) {
        await recordActivity(
          req.user.claims.sub,
          "delete",
          "dev_plan",
          id,
          {}
        );
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete development plan" });
    }
  });

  // Tags
  app.post("/api/tags", validateBody(insertTagSchema), async (req, res) => {
    try {
      const tag = await storage.createTag(req.validatedBody);
      res.status(201).json(tag);
    } catch (error) {
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.patch("/api/tags/:id", validateBody(insertTagSchema.partial()), async (req, res) => {
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

  app.delete("/api/tags/:id", async (req, res) => {
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

  // AI Assistant Routes
  app.post("/api/ai/generate-task-suggestions", async (req, res) => {
    try {
      const { projectDescription, projectName } = req.body;
      if (!projectDescription || !projectName) {
        return res.status(400).json({ message: "Project description and name are required" });
      }

      const suggestions = await aiService.generateTaskSuggestions(projectDescription, projectName);
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating task suggestions:", error);
      res.status(500).json({ message: "Failed to generate task suggestions" });
    }
  });

  app.post("/api/ai/process-task-update", async (req, res) => {
    try {
      const { taskId, currentStatus, update } = req.body;
      if (!taskId || !currentStatus || !update) {
        return res.status(400).json({ message: "Task ID, current status, and update are required" });
      }

      const processed = await aiService.processNaturalLanguageUpdate(taskId, currentStatus, update);
      res.json(processed);
    } catch (error) {
      console.error("Error processing natural language update:", error);
      res.status(500).json({ message: "Failed to process natural language update" });
    }
  });

  app.post("/api/ai/client-insights", async (req, res) => {
    try {
      const { clientData } = req.body;
      if (!clientData) {
        return res.status(400).json({ message: "Client data is required" });
      }

      const insights = await aiService.generateClientInsights(clientData);
      res.json(insights);
    } catch (error) {
      console.error("Error generating client insights:", error);
      res.status(500).json({ message: "Failed to generate client insights" });
    }
  });

  app.post("/api/ai/search-prospective-clients", async (req, res) => {
    try {
      const { industry, criteria } = req.body;
      if (!industry || !criteria) {
        return res.status(400).json({ message: "Industry and criteria are required" });
      }

      const prospects = await aiService.searchProspectiveClients(industry, criteria);
      res.json(prospects);
    } catch (error) {
      console.error("Error searching for prospective clients:", error);
      res.status(500).json({ message: "Failed to search for prospective clients" });
    }
  });

  app.post("/api/ai/dashboard-insights", async (req, res) => {
    try {
      // Validate that there's context information in the request
      if (!req.body || !req.body.contextInfo) {
        return res.status(400).json({ message: "Context information is required" });
      }

      const insights = await aiService.generateDashboardInsights(req.body);
      res.json(insights);
    } catch (error) {
      console.error("Error generating dashboard insights:", error);
      res.status(500).json({ message: "Failed to generate dashboard insights" });
    }
  });

  app.post("/api/ai/task-advice", async (req, res) => {
    try {
      const { taskDescription, taskStatus } = req.body;
      if (!taskDescription || !taskStatus) {
        return res.status(400).json({ message: "Task description and status are required" });
      }

      const advice = await aiService.getTaskAdvice(taskDescription, taskStatus);
      res.json(advice);
    } catch (error) {
      console.error("Error getting task advice:", error);
      res.status(500).json({ message: "Failed to get task advice" });
    }
  });

  // Gmail Integration Routes
  app.get("/api/gmail/status", async (req, res) => {
    try {
      const status = await gmailService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error("Gmail status error:", error);
      res.json({ connected: false, errorMessage: "Unable to check Gmail connection" });
    }
  });

  app.get("/api/gmail/auth", async (req, res) => {
    try {
      const authUrl = await gmailService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Gmail auth error:", error);
      res.status(500).json({ message: "Failed to generate auth URL" });
    }
  });

  app.get("/api/gmail/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }
      
      await gmailService.handleAuthCallback(code as string);
      res.redirect("/dashboard?gmail=connected");
    } catch (error) {
      console.error("Gmail callback error:", error);
      res.status(500).json({ message: "Failed to handle auth callback" });
    }
  });

  app.post("/api/gmail/sync", async (req, res) => {
    try {
      await gmailService.syncEmails();
      res.json({ message: "Email sync completed" });
    } catch (error) {
      console.error("Gmail sync error:", error);
      res.status(500).json({ message: "Failed to sync emails" });
    }
  });

  // Email management endpoints
  app.get("/api/emails", async (req, res) => {
    try {
      const emails = await storage.getEmails();
      res.json(emails);
    } catch (error) {
      console.error("Get emails error:", error);
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.get("/api/emails/stats", async (req, res) => {
    try {
      const stats = await storage.getEmailStats();
      res.json(stats);
    } catch (error) {
      console.error("Get email stats error:", error);
      res.status(500).json({ message: "Failed to fetch email stats" });
    }
  });

  app.get("/api/emails/needs-response", async (req, res) => {
    try {
      const emails = await storage.getEmailsNeedingResponse();
      res.json(emails);
    } catch (error) {
      console.error("Get emails needing response error:", error);
      res.status(500).json({ message: "Failed to fetch emails needing response" });
    }
  });

  // Revenue endpoints
  app.get("/api/revenue", async (req, res) => {
    try {
      const revenues = await storage.getRevenues();
      res.json(revenues);
    } catch (error) {
      console.error("Get revenues error:", error);
      res.status(500).json({ message: "Failed to fetch revenues" });
    }
  });

  app.get("/api/revenue/metrics", async (req, res) => {
    try {
      const metrics = await storage.getRevenueMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Get revenue metrics error:", error);
      res.status(500).json({ message: "Failed to fetch revenue metrics" });
    }
  });

  // Reports endpoints
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
