import { Router } from "express";
import { db } from "../config/db";
import { tasks, leads, projects, clients } from "@shared/schema";
import { logger } from "../utils/logger";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { modules, format, dateRange } = req.body;
    const data: Record<string, any[]> = {};

    // Calculate date filter
    let dateFilter: Date | null = null;
    if (dateRange !== 'all') {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - parseInt(dateRange));
    }

    // Export tasks
    if (modules.includes('tasks')) {
      let taskQuery = db.select().from(tasks);
      data.tasks = await taskQuery;
    }

    // Export leads
    if (modules.includes('leads')) {
      let leadQuery = db.select().from(leads);
      data.leads = await leadQuery;
    }

    // Export projects
    if (modules.includes('projects')) {
      let projectQuery = db.select().from(projects);
      data.projects = await projectQuery;
    }

    // Export clients
    if (modules.includes('clients')) {
      let clientQuery = db.select().from(clients);
      data.clients = await clientQuery;
    }

    if (format === 'csv') {
      // Convert to CSV format - simplified for now
      let csvContent = '';
      Object.entries(data).forEach(([tableName, records]) => {
        if (records.length > 0) {
          csvContent += `\n\n=== ${tableName.toUpperCase()} ===\n`;
          const headers = Object.keys(records[0]);
          csvContent += headers.join(',') + '\n';
          records.forEach(record => {
            const values = headers.map(header => {
              const value = record[header];
              return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvContent += values.join(',') + '\n';
          });
        }
      });
      res.setHeader('Content-Type', 'text/csv');
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    }
  } catch (error) {
    logger.error("Error exporting data:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
});

export default router;