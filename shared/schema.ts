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

export const devPlanStageEnum = pgEnum("dev_plan_stage", [
  "planning",
  "build",
  "revise",
  "live",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "review",
  "completed",
]);

// CurtisOS specific enums
export const contextEnum = pgEnum("context", [
  "notrom",
  "podcast",
  "day_job",
  "general",
  "personal",
  "home",
  "finance",
]);

export const episodeStatusEnum = pgEnum("episode_status", [
  "planning",
  "research",
  "recording",
  "editing",
  "published",
  "archived",
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
  context: contextEnum("context").default("general").notNull(),
  dueDate: timestamp("due_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CurtisOS - Podcast Episodes module
export const podcastEpisodes = pgTable("podcast_episodes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  episodeNumber: integer("episode_number"),
  status: episodeStatusEnum("status").default("planning").notNull(),
  publishDate: timestamp("publish_date"),
  duration: integer("duration"), // in minutes
  topics: text("topics").array(),
  guests: text("guests").array(),
  notes: text("notes"),
  youtubeUrl: varchar("youtube_url", { length: 255 }),
  spotifyUrl: varchar("spotify_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Life Trackers module
export const lifeTrackers = pgTable("life_trackers", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // meal, habit, diy, expense, grocery
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  amount: integer("amount"), // for expenses
  context: contextEnum("context").default("personal").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Gmail Integration - Emails module
export const emailStatusEnum = pgEnum("email_status", [
  "unread",
  "read",
  "needs_response",
  "responded",
  "archived",
  "snoozed"
]);

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  gmailId: varchar("gmail_id", { length: 100 }).notNull().unique(),
  threadId: varchar("thread_id", { length: 100 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  fromName: varchar("from_name", { length: 255 }),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  body: text("body"),
  snippet: text("snippet"),
  status: emailStatusEnum("status").default("unread").notNull(),
  context: contextEnum("context").default("general").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  responseNeededBy: timestamp("response_needed_by"),
  aiSuggestedResponse: text("ai_suggested_response"),
  labels: text("labels").array(),
  attachments: json("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Revenue Tracking module
export const revenueTypeEnum = pgEnum("revenue_type", [
  "notrom_project",
  "podcast_sponsorship", 
  "day_job_salary",
  "consulting",
  "other"
]);

export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  type: revenueTypeEnum("type").notNull(),
  context: contextEnum("context").notNull(),
  amount: integer("amount").notNull(), // in cents for precision
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  description: text("description"),
  projectId: integer("project_id").references(() => projects.id),
  clientId: integer("client_id").references(() => clients.id),
  receivedAt: timestamp("received_at").notNull(),
  expectedAt: timestamp("expected_at"),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reports module for dashboard analytics
export const reportTypeEnum = pgEnum("report_type", [
  "talent_summary",
  "podcast_analytics", 
  "notrom_revenue",
  "monthly_overview",
  "custom"
]);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  type: reportTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  context: contextEnum("context").notNull(),
  content: json("content").notNull(), // structured report data
  dateRange: json("date_range"), // {start: date, end: date}
  generatedBy: varchar("generated_by").references(() => users.id),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  scheduledFor: timestamp("scheduled_for"),
  isScheduled: boolean("is_scheduled").default(false),
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

// Development Plans for projects
export const devPlans = pgTable("dev_plans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  currentStage: devPlanStageEnum("current_stage").default("planning").notNull(),
  planningNotes: text("planning_notes"),
  buildNotes: text("build_notes"),
  reviseNotes: text("revise_notes"),
  liveNotes: text("live_notes"),
  planningStartDate: timestamp("planning_start_date"),
  planningEndDate: timestamp("planning_end_date"),
  buildStartDate: timestamp("build_start_date"),
  buildEndDate: timestamp("build_end_date"),
  reviseStartDate: timestamp("revise_start_date"),
  reviseEndDate: timestamp("revise_end_date"),
  liveStartDate: timestamp("live_start_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export const insertDevPlanSchema = createInsertSchema(devPlans);
export const insertPodcastEpisodeSchema = createInsertSchema(podcastEpisodes);
export const insertLifeTrackerSchema = createInsertSchema(lifeTrackers);
export const insertEmailSchema = createInsertSchema(emails);
export const insertRevenueSchema = createInsertSchema(revenues);
export const insertReportSchema = createInsertSchema(reports);

// Define types for insert operations
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertDevPlan = z.infer<typeof insertDevPlanSchema>;
export type InsertPodcastEpisode = z.infer<typeof insertPodcastEpisodeSchema>;
export type InsertLifeTracker = z.infer<typeof insertLifeTrackerSchema>;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

// Define types for select operations
export type Lead = typeof leads.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type DevPlan = typeof devPlans.$inferSelect;
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type LifeTracker = typeof lifeTrackers.$inferSelect;
export type Email = typeof emails.$inferSelect;
export type Revenue = typeof revenues.$inferSelect;
export type Report = typeof reports.$inferSelect;
