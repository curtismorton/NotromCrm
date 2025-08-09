import type { Express } from "express";
import { createServer, type Server } from "http";

import dashboardRouter from "./dashboard";
import leadsRouter from "./leads";
import projectsRouter from "./projects";
import clientsRouter from "./clients";
import tasksRouter from "./tasks";
import devPlansRouter from "./devPlans";
import tagsRouter from "./tags";
import emailsRouter from "./emails";
import aiRouter from "./ai";
import deliveriesRouter from "./deliveries";
import automationsRouter from "./automations";
import revenueRouter from "./revenue";
import reportsRouter from "./reports";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/clients", clientsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/dev-plans", devPlansRouter);
  app.use("/api/tags", tagsRouter);
  app.use("/api", emailsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/deliveries", deliveriesRouter);
  app.use("/api/automations", automationsRouter);
  app.use("/api/revenue", revenueRouter);
  app.use("/api/reports", reportsRouter);

  const httpServer = createServer(app);
  return httpServer;
}
