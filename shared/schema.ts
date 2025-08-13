import {
  pgTable,
  text,
  serial,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
  foreignKey,
  json,
  unique,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keep existing for auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

// Session storage (keep existing)
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Enums
export const leadSourceEnum = pgEnum("lead_source", [
  "referral", "website", "linkedin", "email", "cold_outreach", "event", "other"
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new", "contacted", "qualified", "proposed", "won", "lost"
]);

export const taskPriorityEnum = pgEnum("task_priority", ["p1", "p2", "p3"]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo", "in_progress", "review", "completed", "cancelled"
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning", "in_production", "review", "live", "on_hold", "completed"
]);

// Legacy enums (keep for backward compatibility)
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const contextEnum = pgEnum("context", [
  "notrom",
  "podcast",
  "day_job", 
  "general",
  "personal",
  "work_personal"
]);

// Core tables
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  source: leadSourceEnum("source").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  status: leadStatusEnum("status").notNull().default("new"),
  valueEstimate: numeric("value_estimate", { precision: 10, scale: 2 }),
  nextActionAt: timestamp("next_action_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  clientId: integer("client_id").references(() => clients.id),
  status: projectStatusEnum("status").notNull().default("planning"),
  kickoffDate: date("kickoff_date"),
  dueDate: date("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  priority: taskPriorityEnum("priority").default("p2"),
  dueAt: timestamp("due_at"),
  status: taskStatusEnum("status").notNull().default("todo"),
  context: contextEnum("context"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy tables (keep for data migration)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  actorId: varchar("actor_id").references(() => users.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: integer("target_id").notNull(),
  payload: json("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devPlans = pgTable("dev_plans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  plan: json("plan").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tag relationships
export const leadTags = pgTable("lead_tags", {
  leadId: integer("lead_id").references(() => leads.id),
  tagId: integer("tag_id").references(() => tags.id),
});

export const projectTags = pgTable("project_tags", {
  projectId: integer("project_id").references(() => projects.id),
  tagId: integer("tag_id").references(() => tags.id),
});

export const clientTags = pgTable("client_tags", {
  clientId: integer("client_id").references(() => clients.id),
  tagId: integer("tag_id").references(() => tags.id),
});

export const taskTags = pgTable("task_tags", {
  taskId: integer("task_id").references(() => tasks.id),
  tagId: integer("tag_id").references(() => tags.id),
});

// Stub tables for backward compatibility (will be removed in future)
export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 255 }),
  body: text("body"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for forms
export const insertLeadSchema = createInsertSchema(leads);
export const insertClientSchema = createInsertSchema(clients);
export const insertProjectSchema = createInsertSchema(projects);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertTagSchema = createInsertSchema(tags);
export const insertActivitySchema = createInsertSchema(activities);
export const insertDevPlanSchema = createInsertSchema(devPlans);
export const insertEmailSchema = createInsertSchema(emails);
export const insertRevenueSchema = createInsertSchema(revenues);
export const insertReportSchema = createInsertSchema(reports);
export const insertDeliverySchema = createInsertSchema(deliveries);
export const insertAutomationSchema = createInsertSchema(automations);

// Types
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

export type DevPlan = typeof devPlans.$inferSelect;
export type InsertDevPlan = typeof devPlans.$inferInsert;

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;