import {
  users,
  leads,
  projects,
  clients,
  tasks,
  tags,
  activities,
  devPlans,
  talent,
  brands,
  campaigns,
  deliverables,
  invoices,
  contracts,
  touchpoints,
  type User,
  type Lead,
  type Project,
  type Client,
  type Task,
  type Tag,
  type Activity,
  type DevPlan,
  type Talent,
  type Brand,
  type Campaign,
  type Deliverable,
  type Invoice,
  type Contract,
  type Touchpoint,
  type UpsertUser,
  type InsertLead,
  type InsertProject,
  type InsertClient,
  type InsertTask,
  type InsertTalent,
  type InsertBrand,
  type InsertCampaign,
  type InsertDeliverable,
  type InsertInvoice,
  type InsertContract,
  type InsertTouchpoint,
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
  
  // Talent Management
  createTalent(talent: any): Promise<any>;
  getTalent(id: number): Promise<any | undefined>;
  getTalents(filters?: any): Promise<any[]>;
  updateTalent(id: number, talent: any): Promise<any | undefined>;
  deleteTalent(id: number): Promise<boolean>;
  
  createBrand(brand: any): Promise<any>;
  getBrand(id: number): Promise<any | undefined>;
  getBrands(filters?: any): Promise<any[]>;
  updateBrand(id: number, brand: any): Promise<any | undefined>;
  deleteBrand(id: number): Promise<boolean>;
  
  createCampaign(campaign: any): Promise<any>;
  getCampaign(id: number): Promise<any | undefined>;
  getCampaigns(filters?: any): Promise<any[]>;
  updateCampaign(id: number, campaign: any): Promise<any | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  createDeliverable(deliverable: any): Promise<any>;
  getDeliverable(id: number): Promise<any | undefined>;
  getDeliverables(filters?: any): Promise<any[]>;
  updateDeliverable(id: number, deliverable: any): Promise<any | undefined>;
  deleteDeliverable(id: number): Promise<boolean>;
  
  createInvoice(invoice: any): Promise<any>;
  getInvoice(id: number): Promise<any | undefined>;
  getInvoices(filters?: any): Promise<any[]>;
  updateInvoice(id: number, invoice: any): Promise<any | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  createContract(contract: any): Promise<any>;
  getContract(id: number): Promise<any | undefined>;
  getContracts(filters?: any): Promise<any[]>;
  updateContract(id: number, contract: any): Promise<any | undefined>;
  deleteContract(id: number): Promise<boolean>;
  
  createTouchpoint(touchpoint: any): Promise<any>;
  getTouchpoint(id: number): Promise<any | undefined>;
  getTouchpoints(filters?: any): Promise<any[]>;
  updateTouchpoint(id: number, touchpoint: any): Promise<any | undefined>;
  deleteTouchpoint(id: number): Promise<boolean>;
  
  // Talent Management Stats
  getTalentStats(): Promise<{
    activeCampaigns: number;
    deliverablesDueToday: number;
    deliverablesDueThisWeek: number;
    pipelineValue: string;
    pipelineCount: number;
    overdueInvoicesCount: number;
    overdueInvoicesAmount: string;
    usageExpiringCount: number;
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

    const [completeLeads] = await db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.status, 'complete'));

    return {
      totalLeads: totalLeads?.count || 0,
      activeLeads: (totalLeads?.count || 0) - (completeLeads?.count || 0),
      completeLeads: completeLeads?.count || 0,
      conversionRate: totalLeads?.count > 0 ? ((completeLeads?.count || 0) / totalLeads.count * 100).toFixed(1) : '0'
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

  // Talent Management CRUD operations
  
  // Talent
  async createTalent(talentData: InsertTalent): Promise<Talent> {
    const [talentRecord] = await db.insert(talent).values(talentData).returning();
    return talentRecord;
  }

  async getTalent(id: number): Promise<Talent | undefined> {
    const [talentRecord] = await db.select().from(talent).where(eq(talent.id, id));
    return talentRecord;
  }

  async getTalents(filters?: Partial<Talent>): Promise<Talent[]> {
    let query = db.select().from(talent);
    
    if (filters) {
      const conditions = [];
      if (filters.primaryPlatform) conditions.push(eq(talent.primaryPlatform, filters.primaryPlatform));
      if (filters.niche) conditions.push(eq(talent.niche, filters.niche));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(talent.createdAt));
  }

  async updateTalent(id: number, talentData: Partial<InsertTalent>): Promise<Talent | undefined> {
    const [updated] = await db
      .update(talent)
      .set({ ...talentData, updatedAt: new Date() })
      .where(eq(talent.id, id))
      .returning();
    return updated;
  }

  async deleteTalent(id: number): Promise<boolean> {
    const result = await db.delete(talent).where(eq(talent.id, id)).returning({ id: talent.id });
    return result.length > 0;
  }

  // Brands
  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(brandData).returning();
    return brand;
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrands(filters?: Partial<Brand>): Promise<Brand[]> {
    let query = db.select().from(brands);
    
    if (filters) {
      const conditions = [];
      if (filters.industry) conditions.push(eq(brands.industry, filters.industry));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(brands.createdAt));
  }

  async updateBrand(id: number, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const [updated] = await db
      .update(brands)
      .set({ ...brandData, updatedAt: new Date() })
      .where(eq(brands.id, id))
      .returning();
    return updated;
  }

  async deleteBrand(id: number): Promise<boolean> {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning({ id: brands.id });
    return result.length > 0;
  }

  // Campaigns
  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db.insert(campaigns).values(campaignData).returning();
    return campaign;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getCampaigns(filters?: Partial<Campaign>): Promise<Campaign[]> {
    let query = db.select().from(campaigns);
    
    if (filters) {
      const conditions = [];
      if (filters.stage) conditions.push(eq(campaigns.stage, filters.stage));
      if (filters.brandId) conditions.push(eq(campaigns.brandId, filters.brandId));
      if (filters.talentId) conditions.push(eq(campaigns.talentId, filters.talentId));
      if (filters.healthScore) conditions.push(eq(campaigns.healthScore, filters.healthScore));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(campaigns.createdAt));
  }

  async updateCampaign(id: number, campaignData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updated] = await db
      .update(campaigns)
      .set({ ...campaignData, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return updated;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id)).returning({ id: campaigns.id });
    return result.length > 0;
  }

  // Deliverables
  async createDeliverable(deliverableData: InsertDeliverable): Promise<Deliverable> {
    const [deliverable] = await db.insert(deliverables).values(deliverableData).returning();
    return deliverable;
  }

  async getDeliverable(id: number): Promise<Deliverable | undefined> {
    const [deliverable] = await db.select().from(deliverables).where(eq(deliverables.id, id));
    return deliverable;
  }

  async getDeliverables(filters?: Partial<Deliverable>): Promise<Deliverable[]> {
    let query = db.select().from(deliverables);
    
    if (filters) {
      const conditions = [];
      if (filters.campaignId) conditions.push(eq(deliverables.campaignId, filters.campaignId));
      if (filters.status) conditions.push(eq(deliverables.status, filters.status));
      if (filters.platform) conditions.push(eq(deliverables.platform, filters.platform));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(deliverables.createdAt));
  }

  async updateDeliverable(id: number, deliverableData: Partial<InsertDeliverable>): Promise<Deliverable | undefined> {
    const [updated] = await db
      .update(deliverables)
      .set({ ...deliverableData, updatedAt: new Date() })
      .where(eq(deliverables.id, id))
      .returning();
    return updated;
  }

  async deleteDeliverable(id: number): Promise<boolean> {
    const result = await db.delete(deliverables).where(eq(deliverables.id, id)).returning({ id: deliverables.id });
    return result.length > 0;
  }

  // Invoices
  async createInvoice(invoiceData: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoices(filters?: Partial<Invoice>): Promise<Invoice[]> {
    let query = db.select().from(invoices);
    
    if (filters) {
      const conditions = [];
      if (filters.campaignId) conditions.push(eq(invoices.campaignId, filters.campaignId));
      if (filters.status) conditions.push(eq(invoices.status, filters.status));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(invoices.createdAt));
  }

  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id)).returning({ id: invoices.id });
    return result.length > 0;
  }

  // Contracts
  async createContract(contractData: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(contracts).values(contractData).returning();
    return contract;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContracts(filters?: Partial<Contract>): Promise<Contract[]> {
    let query = db.select().from(contracts);
    
    if (filters) {
      const conditions = [];
      if (filters.campaignId) conditions.push(eq(contracts.campaignId, filters.campaignId));
      if (filters.type) conditions.push(eq(contracts.type, filters.type));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(contracts.createdAt));
  }

  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updated] = await db
      .update(contracts)
      .set({ ...contractData, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return updated;
  }

  async deleteContract(id: number): Promise<boolean> {
    const result = await db.delete(contracts).where(eq(contracts.id, id)).returning({ id: contracts.id });
    return result.length > 0;
  }

  // Touchpoints
  async createTouchpoint(touchpointData: InsertTouchpoint): Promise<Touchpoint> {
    const [touchpoint] = await db.insert(touchpoints).values(touchpointData).returning();
    return touchpoint;
  }

  async getTouchpoint(id: number): Promise<Touchpoint | undefined> {
    const [touchpoint] = await db.select().from(touchpoints).where(eq(touchpoints.id, id));
    return touchpoint;
  }

  async getTouchpoints(filters?: Partial<Touchpoint>): Promise<Touchpoint[]> {
    let query = db.select().from(touchpoints);
    
    if (filters) {
      const conditions = [];
      if (filters.campaignId) conditions.push(eq(touchpoints.campaignId, filters.campaignId));
      if (filters.talentId) conditions.push(eq(touchpoints.talentId, filters.talentId));
      if (filters.brandId) conditions.push(eq(touchpoints.brandId, filters.brandId));
      if (filters.type) conditions.push(eq(touchpoints.type, filters.type));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query.orderBy(desc(touchpoints.createdAt));
  }

  async updateTouchpoint(id: number, touchpointData: Partial<InsertTouchpoint>): Promise<Touchpoint | undefined> {
    const [updated] = await db
      .update(touchpoints)
      .set(touchpointData)
      .where(eq(touchpoints.id, id))
      .returning();
    return updated;
  }

  async deleteTouchpoint(id: number): Promise<boolean> {
    const result = await db.delete(touchpoints).where(eq(touchpoints.id, id)).returning({ id: touchpoints.id });
    return result.length > 0;
  }

  // Talent Management Stats
  async getTalentStats() {
    const [activeCampaignsStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(
        and(
          sql`${campaigns.stage} NOT IN ('completed', 'cancelled')`
        )
      );

    const [deliverablesDueTodayStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliverables)
      .where(
        sql`DATE(${deliverables.dueDate}) = CURRENT_DATE`
      );

    const [deliverablesDueThisWeekStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliverables)
      .where(
        sql`${deliverables.dueDate} BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
      );

    const [pipelineStats] = await db
      .select({
        value: sql<string>`COALESCE(SUM(${campaigns.dealValue}), 0)`,
        count: sql<number>`count(*)`
      })
      .from(campaigns)
      .where(
        sql`${campaigns.stage} IN ('pitch', 'negotiation', 'confirmed')`
      );

    const [overdueInvoicesStats] = await db
      .select({
        count: sql<number>`count(*)`,
        amount: sql<string>`COALESCE(SUM(${invoices.amount}), 0)`
      })
      .from(invoices)
      .where(eq(invoices.status, 'overdue'));

    const [usageExpiringStats] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contracts)
      .where(
        sql`${contracts.usageRightsExpiry} BETWEEN NOW() AND NOW() + INTERVAL '30 days'`
      );

    return {
      activeCampaigns: activeCampaignsStats?.count || 0,
      deliverablesDueToday: deliverablesDueTodayStats?.count || 0,
      deliverablesDueThisWeek: deliverablesDueThisWeekStats?.count || 0,
      pipelineValue: pipelineStats?.value || '0',
      pipelineCount: pipelineStats?.count || 0,
      overdueInvoicesCount: overdueInvoicesStats?.count || 0,
      overdueInvoicesAmount: overdueInvoicesStats?.amount || '0',
      usageExpiringCount: usageExpiringStats?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();