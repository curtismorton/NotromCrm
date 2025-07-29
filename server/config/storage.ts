import {
  users,
  leads,
  projects,
  clients,
  tasks,
  tags,
  activities,
  leadTags,
  projectTags,
  clientTags,
  taskTags,
  devPlans,
  emails,
  revenues,
  reports,
  type User,
  type Lead,
  type Project,
  type Client,
  type Task,
  type Tag,
  type Activity,
  type DevPlan,
  type Email,
  type Revenue,
  type Report,
  type UpsertUser,
  type InsertLead,
  type InsertProject,
  type InsertClient,
  type InsertTask,
  type InsertTag,
  type InsertActivity,
  type InsertDevPlan,
  type InsertEmail,
  type InsertRevenue,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray, like, and, or, desc, sql, getTableColumns } from "drizzle-orm";

export interface IStorage {
  // User operations (required for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLead(id: number): Promise<Lead | undefined>;
  getLeads(filters?: Partial<Lead>): Promise<Lead[]>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  searchLeads(term: string): Promise<Lead[]>;
  
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjects(filters?: Partial<Project>): Promise<Project[]>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectsByLead(leadId: number): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  
  // Clients
  createClient(client: InsertClient): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  getClients(filters?: Partial<Client>): Promise<Client[]>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  searchClients(term: string): Promise<Client[]>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasks(filters?: Partial<Task>): Promise<Task[]>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksDueSoon(days: number): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;
  
  // Tags
  createTag(tag: InsertTag): Promise<Tag>;
  getTag(id: number): Promise<Tag | undefined>;
  getTags(): Promise<Tag[]>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  
  // Tag relationships
  addTagToLead(leadId: number, tagId: number): Promise<void>;
  removeTagFromLead(leadId: number, tagId: number): Promise<void>;
  getTagsByLead(leadId: number): Promise<Tag[]>;
  
  addTagToProject(projectId: number, tagId: number): Promise<void>;
  removeTagFromProject(projectId: number, tagId: number): Promise<void>;
  getTagsByProject(projectId: number): Promise<Tag[]>;
  
  addTagToClient(clientId: number, tagId: number): Promise<void>;
  removeTagFromClient(clientId: number, tagId: number): Promise<void>;
  getTagsByClient(clientId: number): Promise<Tag[]>;
  
  addTagToTask(taskId: number, tagId: number): Promise<void>;
  removeTagFromTask(taskId: number, tagId: number): Promise<void>;
  getTagsByTask(taskId: number): Promise<Tag[]>;
  
  // Development Plans
  createDevPlan(devPlan: InsertDevPlan): Promise<DevPlan>;
  getDevPlan(id: number): Promise<DevPlan | undefined>;
  getDevPlanByProject(projectId: number): Promise<DevPlan | undefined>;
  getDevPlans(filters?: Partial<DevPlan>): Promise<DevPlan[]>;
  updateDevPlan(id: number, devPlan: Partial<InsertDevPlan>): Promise<DevPlan | undefined>;
  deleteDevPlan(id: number): Promise<boolean>;
  updateDevPlanStage(id: number, stage: string, startDate?: Date, endDate?: Date): Promise<DevPlan | undefined>;
  
  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  getActivitiesByUser(userId: string): Promise<Activity[]>;
  getActivitiesByEntity(entityType: string, entityId: number): Promise<Activity[]>;
  
  // Emails
  createEmail(email: InsertEmail): Promise<Email>;
  getEmails(filters?: { context?: string; status?: string; limit?: number }): Promise<Email[]>;
  getEmailsNeedingResponse(): Promise<Email[]>;
  getEmailStats(): Promise<{
    totalEmails: number;
    needsResponse: number;
    overdue: number;
    contextBreakdown: Record<string, number>;
  }>;
  markEmailAsResponded(emailId: number): Promise<void>;

  // Revenues
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  getRevenues(filters?: { context?: string; startDate?: string; endDate?: string; limit?: number }): Promise<Revenue[]>;
  getRevenueMetrics(context?: string): Promise<{
    totalRevenue: number;
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    monthlyGrowth: number;
    revenueByType: Record<string, number>;
  }>;

  // Reports
  createReport(report: InsertReport): Promise<Report>;
  getReports(context?: string, limit?: number): Promise<Report[]>;

  // Dashboard data
  getDashboardStats(): Promise<{
    totalLeads: number;
    activeProjects: number;
    totalClients: number;
    overdueTasks: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Leads
  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(leadData).returning();
    return lead;
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeads(filters?: Partial<Lead>): Promise<Lead[]> {
    let query = db.select().from(leads);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(leads.status, filters.status));
      if (filters.priority) conditions.push(eq(leads.priority, filters.priority));
      if (filters.assignedTo) conditions.push(eq(leads.assignedTo, filters.assignedTo));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(leads.createdAt));
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db
      .update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
    return result.length > 0;
  }

  async searchLeads(term: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(
        or(
          like(leads.companyName, `%${term}%`),
          like(leads.contactName, `%${term}%`),
          like(leads.contactEmail, `%${term}%`),
          like(leads.industry, `%${term}%`)
        )
      );
  }

  // Projects
  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjects(filters?: Partial<Project>): Promise<Project[]> {
    let query = db.select().from(projects);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(projects.status, filters.status));
      if (filters.leadId) conditions.push(eq(projects.leadId, filters.leadId));
      if (filters.clientId) conditions.push(eq(projects.clientId, filters.clientId));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(projects.createdAt));
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    return result.length > 0;
  }

  async getProjectsByLead(leadId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.leadId, leadId));
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  // Clients
  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClients(filters?: Partial<Client>): Promise<Client[]> {
    let query = db.select().from(clients);
    
    if (filters) {
      const conditions = [];
      if (filters.industry) conditions.push(eq(clients.industry, filters.industry));
      if (filters.upsellOpportunity !== undefined) conditions.push(eq(clients.upsellOpportunity, filters.upsellOpportunity));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(clients.createdAt));
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db
      .update(clients)
      .set({ ...clientData, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id)).returning({ id: clients.id });
    return result.length > 0;
  }

  async searchClients(term: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.companyName, `%${term}%`),
          like(clients.contactName, `%${term}%`),
          like(clients.contactEmail, `%${term}%`),
          like(clients.industry, `%${term}%`)
        )
      );
  }

  // Tasks
  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasks(filters?: Partial<Task>): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(tasks.status, filters.status));
      if (filters.priority) conditions.push(eq(tasks.priority, filters.priority));
      if (filters.assignedTo) conditions.push(eq(tasks.assignedTo, filters.assignedTo));
      if (filters.projectId) conditions.push(eq(tasks.projectId, filters.projectId));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    // If updating to completed status, set completedAt
    if (taskData.status === 'completed' && !taskData.completedAt) {
      taskData.completedAt = new Date();
    }
    
    const [updated] = await db
      .update(tasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    return result.length > 0;
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksDueSoon(days: number): Promise<Task[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          sql`${tasks.dueDate} >= ${now}`,
          sql`${tasks.dueDate} <= ${future}`,
          eq(tasks.status, 'todo')
        )
      )
      .orderBy(tasks.dueDate);
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(tasks.dueDate);
  }

  // Tags
  async createTag(tagData: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(tagData).returning();
    return tag;
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(tags.name);
  }

  async updateTag(id: number, tagData: Partial<InsertTag>): Promise<Tag | undefined> {
    const [updated] = await db
      .update(tags)
      .set(tagData)
      .where(eq(tags.id, id))
      .returning();
    return updated;
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id });
    return result.length > 0;
  }

  // Tag relationships
  async addTagToLead(leadId: number, tagId: number): Promise<void> {
    await db.insert(leadTags).values({ leadId, tagId }).onConflictDoNothing();
  }

  async removeTagFromLead(leadId: number, tagId: number): Promise<void> {
    await db.delete(leadTags).where(
      and(
        eq(leadTags.leadId, leadId),
        eq(leadTags.tagId, tagId)
      )
    );
  }

  async getTagsByLead(leadId: number): Promise<Tag[]> {
    return await db
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tags)
      .innerJoin(leadTags, eq(tags.id, leadTags.tagId))
      .where(eq(leadTags.leadId, leadId));
  }

  async addTagToProject(projectId: number, tagId: number): Promise<void> {
    await db.insert(projectTags).values({ projectId, tagId }).onConflictDoNothing();
  }

  async removeTagFromProject(projectId: number, tagId: number): Promise<void> {
    await db.delete(projectTags).where(
      and(
        eq(projectTags.projectId, projectId),
        eq(projectTags.tagId, tagId)
      )
    );
  }

  async getTagsByProject(projectId: number): Promise<Tag[]> {
    return await db
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tags)
      .innerJoin(projectTags, eq(tags.id, projectTags.tagId))
      .where(eq(projectTags.projectId, projectId));
  }

  async addTagToClient(clientId: number, tagId: number): Promise<void> {
    await db.insert(clientTags).values({ clientId, tagId }).onConflictDoNothing();
  }

  async removeTagFromClient(clientId: number, tagId: number): Promise<void> {
    await db.delete(clientTags).where(
      and(
        eq(clientTags.clientId, clientId),
        eq(clientTags.tagId, tagId)
      )
    );
  }

  async getTagsByClient(clientId: number): Promise<Tag[]> {
    return await db
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tags)
      .innerJoin(clientTags, eq(tags.id, clientTags.tagId))
      .where(eq(clientTags.clientId, clientId));
  }

  async addTagToTask(taskId: number, tagId: number): Promise<void> {
    await db.insert(taskTags).values({ taskId, tagId }).onConflictDoNothing();
  }

  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    await db.delete(taskTags).where(
      and(
        eq(taskTags.taskId, taskId),
        eq(taskTags.tagId, tagId)
      )
    );
  }

  async getTagsByTask(taskId: number): Promise<Tag[]> {
    return await db
      .select({ id: tags.id, name: tags.name, color: tags.color })
      .from(tags)
      .innerJoin(taskTags, eq(tags.id, taskTags.tagId))
      .where(eq(taskTags.taskId, taskId));
  }

  // Activities
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async getActivitiesByEntity(entityType: string, entityId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.entityType, entityType),
          eq(activities.entityId, entityId)
        )
      )
      .orderBy(desc(activities.createdAt));
  }

  // Development Plans
  async createDevPlan(devPlanData: InsertDevPlan): Promise<DevPlan> {
    const [devPlan] = await db.insert(devPlans).values(devPlanData).returning();
    return devPlan;
  }

  async getDevPlan(id: number): Promise<DevPlan | undefined> {
    const [devPlan] = await db.select().from(devPlans).where(eq(devPlans.id, id));
    return devPlan;
  }

  async getDevPlanByProject(projectId: number): Promise<DevPlan | undefined> {
    const [devPlan] = await db.select().from(devPlans).where(eq(devPlans.projectId, projectId));
    return devPlan;
  }

  async getDevPlans(filters?: Partial<DevPlan>): Promise<DevPlan[]> {
    let query = db.select().from(devPlans);
    
    if (filters) {
      const conditions = [];
      if (filters.currentStage) conditions.push(eq(devPlans.currentStage, filters.currentStage));
      if (filters.projectId) conditions.push(eq(devPlans.projectId, filters.projectId));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(devPlans.createdAt));
  }

  async updateDevPlan(id: number, devPlanData: Partial<InsertDevPlan>): Promise<DevPlan | undefined> {
    const [updated] = await db
      .update(devPlans)
      .set({ ...devPlanData, updatedAt: new Date() })
      .where(eq(devPlans.id, id))
      .returning();
    return updated;
  }

  async deleteDevPlan(id: number): Promise<boolean> {
    const result = await db.delete(devPlans).where(eq(devPlans.id, id)).returning({ id: devPlans.id });
    return result.length > 0;
  }

  async updateDevPlanStage(id: number, stage: string, startDate?: Date, endDate?: Date): Promise<DevPlan | undefined> {
    // Get the current dev plan
    const currentPlan = await this.getDevPlan(id);
    if (!currentPlan) return undefined;
    
    const updates: Partial<InsertDevPlan> = {
      currentStage: stage as any, // Cast to satisfy TypeScript
    };
    
    // Set stage-specific date fields based on the stage
    switch (stage) {
      case 'planning':
        if (startDate) updates.planningStartDate = startDate;
        if (endDate) updates.planningEndDate = endDate;
        break;
      case 'build':
        if (startDate) updates.buildStartDate = startDate;
        if (endDate) updates.buildEndDate = endDate;
        break;
      case 'revise':
        if (startDate) updates.reviseStartDate = startDate;
        if (endDate) updates.reviseEndDate = endDate;
        break;
      case 'live':
        if (startDate) updates.liveStartDate = startDate;
        break;
    }
    
    return await this.updateDevPlan(id, updates);
  }

  // Dashboard data
  async getDashboardStats(): Promise<{
    totalLeads: number;
    activeProjects: number;
    totalClients: number;
    overdueTasks: number;
  }> {
    // Get total leads
    const [leadCount] = await db.select({ count: sql`count(*)` }).from(leads);
    
    // Get active projects
    const [projectCount] = await db
      .select({ count: sql`count(*)` })
      .from(projects)
      .where(
        eq(projects.status, 'in_progress')
      );
    
    // Get total clients
    const [clientCount] = await db.select({ count: sql`count(*)` }).from(clients);
    
    // Get overdue tasks
    const now = new Date();
    const [taskCount] = await db
      .select({ count: sql`count(*)` })
      .from(tasks)
      .where(
        and(
          sql`${tasks.dueDate} < ${now}`,
          eq(tasks.status, 'todo')
        )
      );
    
    return {
      totalLeads: Number(leadCount?.count || 0),
      activeProjects: Number(projectCount?.count || 0),
      totalClients: Number(clientCount?.count || 0),
      overdueTasks: Number(taskCount?.count || 0),
    };
  }

  // Email operations
  async createEmail(email: InsertEmail): Promise<Email> {
    const [newEmail] = await db.insert(emails).values(email).returning();
    return newEmail;
  }

  async getEmails(filters?: { context?: string; status?: string; limit?: number }): Promise<Email[]> {
    let query = db.select().from(emails);
    
    const conditions = [];
    if (filters?.context) conditions.push(eq(emails.context, filters.context as any));
    if (filters?.status) conditions.push(eq(emails.status, filters.status as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query
      .orderBy(desc(emails.receivedAt))
      .limit(filters?.limit || 50);
    
    return results;
  }

  async getEmailsNeedingResponse(): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .where(eq(emails.status, 'needs_response'))
      .orderBy(desc(emails.responseNeededBy));
  }

  async getEmailStats(): Promise<{
    totalEmails: number;
    needsResponse: number;
    overdue: number;
    contextBreakdown: Record<string, number>;
  }> {
    const allEmails = await db.select().from(emails);
    const needsResponse = allEmails.filter(e => e.status === 'needs_response').length;
    const overdue = allEmails.filter(e => 
      e.responseNeededBy && 
      new Date(e.responseNeededBy) < new Date() && 
      e.status === 'needs_response'
    ).length;
    
    const contextBreakdown = allEmails.reduce((acc, email) => {
      acc[email.context] = (acc[email.context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmails: allEmails.length,
      needsResponse,
      overdue,
      contextBreakdown,
    };
  }

  async markEmailAsResponded(emailId: number): Promise<void> {
    await db
      .update(emails)
      .set({ 
        status: 'responded',
        updatedAt: new Date(),
      })
      .where(eq(emails.id, emailId));
  }

  // Revenue operations
  async createRevenue(revenue: InsertRevenue): Promise<Revenue> {
    const [newRevenue] = await db.insert(revenues).values(revenue).returning();
    return newRevenue;
  }

  async getRevenues(filters?: { context?: string; startDate?: string; endDate?: string; limit?: number }): Promise<Revenue[]> {
    let query = db.select().from(revenues);
    
    const conditions = [];
    if (filters?.context) conditions.push(eq(revenues.context, filters.context as any));
    if (filters?.startDate) conditions.push(sql`${revenues.receivedAt} >= ${new Date(filters.startDate)}`);
    if (filters?.endDate) conditions.push(sql`${revenues.receivedAt} <= ${new Date(filters.endDate)}`);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query
      .orderBy(desc(revenues.receivedAt))
      .limit(filters?.limit || 50);
    
    // Convert amounts back to dollars
    return results.map(r => ({
      ...r,
      amount: r.amount / 100,
    }));
  }

  async getRevenueMetrics(context?: string): Promise<{
    totalRevenue: number;
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    monthlyGrowth: number;
    revenueByType: Record<string, number>;
  }> {
    let query = db.select().from(revenues);
    
    if (context) {
      query = query.where(eq(revenues.context, context as any));
    }
    
    const allRevenues = await query;
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const currentMonthRevenue = allRevenues
      .filter(r => new Date(r.receivedAt) >= currentMonth)
      .reduce((sum, r) => sum + r.amount, 0) / 100;
    
    const lastMonthRevenue = allRevenues
      .filter(r => new Date(r.receivedAt) >= lastMonth && new Date(r.receivedAt) < currentMonth)
      .reduce((sum, r) => sum + r.amount, 0) / 100;
    
    const totalRevenue = allRevenues.reduce((sum, r) => sum + r.amount, 0) / 100;
    
    const monthlyGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    const revenueByType = allRevenues.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + r.amount / 100;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      monthlyGrowth,
      revenueByType,
    };
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReports(context?: string, limit?: number): Promise<Report[]> {
    let query = db.select().from(reports);
    
    if (context) {
      query = query.where(eq(reports.context, context as any));
    }
    
    return await query.orderBy(desc(reports.generatedAt)).limit(limit || 10);
  }
}

export const storage = new DatabaseStorage();
