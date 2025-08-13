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
  getProjectsByClient(clientId: number): Promise<Project[]>;
  searchProjects(term: string): Promise<Project[]>;
  
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
  searchTasks(term: string): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  getTasksDueThisWeek(): Promise<Task[]>;
  
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
    
    return query.orderBy(desc(leads.createdAt));
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
          like(leads.email, `%${term}%`)
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
      if (filters.clientId) conditions.push(eq(projects.clientId, filters.clientId));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(projects.createdAt));
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
      .where(like(projects.title, `%${term}%`));
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
    return query.orderBy(desc(clients.createdAt));
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
          like(clients.name, `%${term}%`),
          like(clients.email, `%${term}%`)
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
      if (filters.ownerId) conditions.push(eq(tasks.ownerId, filters.ownerId));
      if (filters.projectId) conditions.push(eq(tasks.projectId, filters.projectId));
      if (filters.context) conditions.push(eq(tasks.context, filters.context));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return query.orderBy(desc(tasks.createdAt));
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
          sql`${tasks.dueAt} < NOW()`
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
          sql`${tasks.dueAt} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
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
          sql`${tasks.dueAt} < NOW()`
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
}

export const storage = new DatabaseStorage();