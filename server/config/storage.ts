import {
  users,
  leads,
  projects,
  clients,
  tasks,
  tags,
  activities,
  devPlans,
  type User,
  type Lead,
  type Project,
  type Client,
  type Task,
  type Tag,
  type Activity,
  type DevPlan,
  type UpsertUser,
  type InsertLead,
  type InsertProject,
  type InsertClient,
  type InsertTask,
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
  getLeads(filters?: any): Promise<Lead[]>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  searchLeads(term: string): Promise<Lead[]>;
  getFilteredLeads(filters: any): Promise<Lead[]>;
  
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjects(filters?: any): Promise<Project[]>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  searchProjects(term: string): Promise<Project[]>;
  
  // Clients
  createClient(client: InsertClient): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  getClients(filters?: any): Promise<Client[]>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  searchClients(term: string): Promise<Client[]>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasks(filters?: any): Promise<Task[]>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  searchTasks(term: string): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  getTasksDueThisWeek(): Promise<Task[]>;
  
  // Legacy stub methods (will be removed)
  createAutomation(automation: any): Promise<any>;
  getAutomation(id: number): Promise<any>;
  getAutomations(filters?: any): Promise<any[]>;
  updateAutomation(id: number, automation: any): Promise<any>;
  deleteAutomation(id: number): Promise<boolean>;
  
  createEmail(email: any): Promise<any>;
  getEmail(id: number): Promise<any>;
  getEmails(filters?: any): Promise<any[]>;
  updateEmail(id: number, email: any): Promise<any>;
  deleteEmail(id: number): Promise<boolean>;
  
  createRevenue(revenue: any): Promise<any>;
  getRevenue(id: number): Promise<any>;
  getRevenues(filters?: any): Promise<any[]>;
  updateRevenue(id: number, revenue: any): Promise<any>;
  deleteRevenue(id: number): Promise<boolean>;
  
  createReport(report: any): Promise<any>;
  getReport(id: number): Promise<any>;
  getReports(filters?: any): Promise<any[]>;
  updateReport(id: number, report: any): Promise<any>;
  deleteReport(id: number): Promise<boolean>;
  
  createDelivery(delivery: any): Promise<any>;
  getDelivery(id: number): Promise<any>;
  getDeliveries(filters?: any): Promise<any[]>;
  updateDelivery(id: number, delivery: any): Promise<any>;
  deleteDelivery(id: number): Promise<boolean>;

  // Additional methods for tags and activities
  getRecentActivities(limit: number): Promise<any[]>;
  createActivity(activity: any): Promise<any>;
  getTag(id: number): Promise<any>;
  getTagsByLead(leadId: number): Promise<any[]>;
  getTagsByProject(projectId: number): Promise<any[]>;
  addTagToLead(leadId: number, tagId: number): Promise<void>;
  removeTagFromLead(leadId: number, tagId: number): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalLeads: number;
    totalClients: number;
    activeProjects: number;
    totalTasks: number;
    completedTasksThisWeek: number;
    overdueTasks: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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
      if (filters.source) conditions.push(eq(leads.source, filters.source));
      
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
          like(leads.contactEmail, `%${term}%`)
        )
      );
  }

  async getFilteredLeads(filters: any): Promise<Lead[]> {
    return this.getLeads(filters);
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

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async searchProjects(term: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(
        or(
          like(projects.name, `%${term}%`),
          like(projects.description, `%${term}%`)
        )
      );
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
          like(clients.contactEmail, `%${term}%`),
          like(clients.contactName, `%${term}%`)
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
      if (filters.context) conditions.push(eq(tasks.context, filters.context));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const updates = { ...taskData, updatedAt: new Date() };
    
    const [updated] = await db
      .update(tasks)
      .set(updates)
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

  async searchTasks(term: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        or(
          like(tasks.title, `%${term}%`),
          like(tasks.description, `%${term}%`)
        )
      );
  }

  async getOverdueTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'todo'),
          sql`${tasks.dueDate} < NOW()`
        )
      );
  }

  async getTasksDueThisWeek(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'todo'),
          sql`${tasks.dueDate} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
        )
      );
  }

  // Dashboard stats
  async getDashboardStats() {
    const [leadStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads);

    const [clientStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients);

    const [activeProjectStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(sql`${projects.status} != 'completed'`);

    const [taskStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks);

    const [completedTasksStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'completed'),
          sql`${tasks.updatedAt} >= NOW() - INTERVAL '7 days'`
        )
      );

    const [overdueTasksStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'todo'),
          sql`${tasks.dueDate} < NOW()`
        )
      );

    return {
      totalLeads: leadStats?.count || 0,
      totalClients: clientStats?.count || 0,
      activeProjects: activeProjectStats?.count || 0,
      totalTasks: taskStats?.count || 0,
      completedTasksThisWeek: completedTasksStats?.count || 0,
      overdueTasks: overdueTasksStats?.count || 0,
    };
  }

  // Pipeline stats method
  async getPipelineStats(): Promise<any> {
    const [totalLeads] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads);

    const [qualifiedLeads] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(sql`${leads.status} = 'qualified'`);

    const [convertedLeads] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(sql`${leads.status} = 'won'`);

    return {
      totalLeads: totalLeads?.count || 0,
      qualifiedLeads: qualifiedLeads?.count || 0,
      convertedLeads: convertedLeads?.count || 0,
      conversionRate: totalLeads?.count > 0 ? ((convertedLeads?.count || 0) / totalLeads.count * 100).toFixed(1) : '0'
    };
  }

  // Legacy stub methods - return empty arrays/objects to prevent crashes
  async getRecentActivities(limit: number): Promise<any[]> {
    return [];
  }

  async createActivity(activity: any): Promise<any> {
    return { id: 1, ...activity };
  }

  async getTag(id: number): Promise<any> {
    return { id, name: "Default Tag", color: "#666666" };
  }

  async getTagsByLead(leadId: number): Promise<any[]> {
    return [];
  }

  async getTagsByProject(projectId: number): Promise<any[]> {
    return [];
  }

  async getTagsByClient(clientId: number): Promise<any[]> {
    return [];
  }

  async getTagsByTask(taskId: number): Promise<any[]> {
    return [];
  }

  async addTagToLead(leadId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async removeTagFromLead(leadId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async addTagToProject(projectId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async removeTagFromProject(projectId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async addTagToClient(clientId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async removeTagFromClient(clientId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async addTagToTask(taskId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    // Stub method
  }

  async createTag(tagData: any): Promise<any> {
    return { id: 1, ...tagData };
  }

  async getTags(): Promise<any[]> {
    return [];
  }

  async updateTag(id: number, tagData: any): Promise<any> {
    return { id, ...tagData };
  }

  async deleteTag(id: number): Promise<boolean> {
    return true;
  }

  async getTasksDueSoon(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'todo'),
          sql`${tasks.dueDate} BETWEEN NOW() AND NOW() + INTERVAL '3 days'`
        )
      );
  }

  async createDevPlan(devPlanData: any): Promise<any> {
    return { id: 1, ...devPlanData };
  }

  async getDevPlans(): Promise<any[]> {
    return [];
  }

  async getDevPlan(id: number): Promise<any> {
    return { id, title: "Default Dev Plan", status: "planning" };
  }

  async getDevPlanByProject(projectId: number): Promise<any> {
    return { id: 1, projectId, title: "Default Dev Plan", status: "planning" };
  }

  async updateDevPlan(id: number, devPlanData: any): Promise<any> {
    return { id, ...devPlanData };
  }

  async updateDevPlanStage(id: number, stage: string): Promise<any> {
    return { id, currentStage: stage };
  }

  async deleteDevPlan(id: number): Promise<boolean> {
    return true;
  }

  async getEmails(): Promise<any[]> {
    return [];
  }

  async getEmailStats(): Promise<any> {
    return {
      totalEmails: 0,
      unreadEmails: 0,
      emailsNeedingResponse: 0,
      responseRate: '0%'
    };
  }

  async getEmailsNeedingResponse(): Promise<any[]> {
    return [];
  }

  async getRevenueMetrics(): Promise<any> {
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      projectedRevenue: 0,
      averageDealValue: 0
    };
  }

  async createAutomation(automation: any): Promise<any> {
    return { id: 1, ...automation };
  }

  async getAutomation(id: number): Promise<any> {
    return { id, name: "Default Automation" };
  }

  async getAutomations(filters?: any): Promise<any[]> {
    return [];
  }

  async updateAutomation(id: number, automation: any): Promise<any> {
    return { id, ...automation };
  }

  async deleteAutomation(id: number): Promise<boolean> {
    return true;
  }

  async createEmail(email: any): Promise<any> {
    return { id: 1, ...email };
  }

  async getEmail(id: number): Promise<any> {
    return { id, subject: "Default Email" };
  }

  async getEmails(filters?: any): Promise<any[]> {
    return [];
  }

  async updateEmail(id: number, email: any): Promise<any> {
    return { id, ...email };
  }

  async deleteEmail(id: number): Promise<boolean> {
    return true;
  }

  async createRevenue(revenue: any): Promise<any> {
    return { id: 1, ...revenue };
  }

  async getRevenue(id: number): Promise<any> {
    return { id, amount: 0 };
  }

  async getRevenues(filters?: any): Promise<any[]> {
    return [];
  }

  async updateRevenue(id: number, revenue: any): Promise<any> {
    return { id, ...revenue };
  }

  async deleteRevenue(id: number): Promise<boolean> {
    return true;
  }

  async createReport(report: any): Promise<any> {
    return { id: 1, ...report };
  }

  async getReport(id: number): Promise<any> {
    return { id, title: "Default Report" };
  }

  async getReports(filters?: any): Promise<any[]> {
    return [];
  }

  async updateReport(id: number, report: any): Promise<any> {
    return { id, ...report };
  }

  async deleteReport(id: number): Promise<boolean> {
    return true;
  }

  async createDelivery(delivery: any): Promise<any> {
    return { id: 1, ...delivery };
  }

  async getDelivery(id: number): Promise<any> {
    return { id, title: "Default Delivery" };
  }

  async getDeliveries(filters?: any): Promise<any[]> {
    return [];
  }

  async updateDelivery(id: number, delivery: any): Promise<any> {
    return { id, ...delivery };
  }

  async deleteDelivery(id: number): Promise<boolean> {
    return true;
  }
}

export const storage = new DatabaseStorage();