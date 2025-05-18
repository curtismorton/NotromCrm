import {
  pgTable,
  text,
  serial,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
  foreignKey,
  json,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (required for authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Enums for statuses and priorities
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "onboarding",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "review",
  "completed",
]);

// Tags for organization
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 7 }).notNull(),
});

// Leads module
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 100 }).notNull(),
  website: varchar("website", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  status: leadStatusEnum("status").default("new").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  notes: text("notes"),
  source: varchar("source", { length: 100 }),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects module
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("planning").notNull(),
  startDate: timestamp("start_date"),
  deadline: timestamp("deadline"),
  completedDate: timestamp("completed_date"),
  budget: integer("budget"),
  leadId: integer("lead_id").references(() => leads.id),
  clientId: integer("client_id").references(() => clients.id),
  contractSigned: boolean("contract_signed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Clients module
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 100 }).notNull(),
  website: varchar("website", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  onboardedDate: timestamp("onboarded_date"),
  upsellOpportunity: boolean("upsell_opportunity").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks module
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Many-to-many relationships
export const leadTags = pgTable("lead_tags", {
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id),
}, (table) => {
  return {
    pk: unique().on(table.leadId, table.tagId),
  };
});

export const projectTags = pgTable("project_tags", {
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id),
}, (table) => {
  return {
    pk: unique().on(table.projectId, table.tagId),
  };
});

export const clientTags = pgTable("client_tags", {
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id),
}, (table) => {
  return {
    pk: unique().on(table.clientId, table.tagId),
  };
});

export const taskTags = pgTable("task_tags", {
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id),
}, (table) => {
  return {
    pk: unique().on(table.taskId, table.tagId),
  };
});

// Activity for tracking changes across the system
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertLeadSchema = createInsertSchema(leads);
export const insertProjectSchema = createInsertSchema(projects);
export const insertClientSchema = createInsertSchema(clients);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertTagSchema = createInsertSchema(tags);
export const insertActivitySchema = createInsertSchema(activities);

// Define types for insert operations
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Define types for select operations
export type Lead = typeof leads.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Activity = typeof activities.$inferSelect;
