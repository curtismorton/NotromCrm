import OpenAI from 'openai';
import { storage } from '../config/storage';
import { reports, revenues, tasks, projects, leads, clients, type InsertReport } from '@shared/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class ReportService {
  async generateTalentReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      // Get talent-related data
      const allTasks = await storage.getTasks();
      const talentTasks = allTasks.filter(t => 
        t.context === 'day_job' && 
        t.createdAt && 
        new Date(t.createdAt) >= startDate && 
        new Date(t.createdAt) <= endDate
      );

      const allRevenues = await storage.getRevenues();
      const talentRevenue = allRevenues.filter(r => 
        r.type === 'day_job_salary' && 
        new Date(r.receivedAt) >= startDate && 
        new Date(r.receivedAt) <= endDate
      );

      // Calculate metrics
      const completedTasks = talentTasks.filter(t => t.status === 'completed').length;
      const totalTasks = talentTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const totalRevenue = talentRevenue.reduce((sum, r) => sum + r.amount, 0); // Already in dollars from storage

      // High priority tasks
      const highPriorityTasks = talentTasks.filter(t => t.priority === 'high').length;
      
      // Recent achievements
      const recentCompletions = talentTasks
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5);

      const reportData = {
        period: { start: startDate, end: endDate },
        metrics: {
          totalTasks,
          completedTasks,
          completionRate: Math.round(completionRate),
          highPriorityTasks,
          totalRevenue,
        },
        recentAchievements: recentCompletions.map(t => ({
          title: t.title,
          completedAt: t.completedAt,
          priority: t.priority,
        })),
        taskBreakdown: {
          todo: talentTasks.filter(t => t.status === 'todo').length,
          inProgress: talentTasks.filter(t => t.status === 'in_progress').length,
          review: talentTasks.filter(t => t.status === 'review').length,
          completed: completedTasks,
        },
      };

      // Generate AI insights
      const insights = await this.generateAIInsights('talent_summary', reportData);

      const report: InsertReport = {
        type: 'talent_summary',
        title: `Talent Management Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        context: 'day_job',
        content: {
          ...reportData,
          aiInsights: insights,
        },
        dateRange: { start: startDate, end: endDate },
        generatedAt: new Date(),
      };

      const savedReport = await storage.createReport(report);
      return savedReport;
    } catch (error) {
      logger.error('Failed to generate talent report', error);
      throw error;
    }
  }

  async generatePodcastReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const allTasks = await storage.getTasks();
      const podcastTasks = allTasks.filter(t => 
        t.context === 'podcast' && 
        t.createdAt && 
        new Date(t.createdAt) >= startDate && 
        new Date(t.createdAt) <= endDate
      );

      const allRevenues = await storage.getRevenues();
      const podcastRevenue = allRevenues.filter(r => 
        r.type === 'podcast_sponsorship' && 
        new Date(r.receivedAt) >= startDate && 
        new Date(r.receivedAt) <= endDate
      );

      const episodeProduction = podcastTasks.filter(t => 
        t.title.toLowerCase().includes('episode') || 
        t.title.toLowerCase().includes('record') ||
        t.title.toLowerCase().includes('edit')
      );

      const totalRevenue = podcastRevenue.reduce((sum, r) => sum + r.amount, 0);
      const episodesProduced = episodeProduction.filter(t => t.status === 'completed').length;

      const reportData = {
        period: { start: startDate, end: endDate },
        metrics: {
          totalTasks: podcastTasks.length,
          completedTasks: podcastTasks.filter(t => t.status === 'completed').length,
          episodesProduced,
          totalRevenue,
          averageRevenuePerEpisode: episodesProduced > 0 ? totalRevenue / episodesProduced : 0,
        },
        productionPipeline: {
          planning: podcastTasks.filter(t => t.status === 'todo' && t.title.toLowerCase().includes('plan')).length,
          recording: podcastTasks.filter(t => t.status === 'in_progress' && t.title.toLowerCase().includes('record')).length,
          editing: podcastTasks.filter(t => t.status === 'in_progress' && t.title.toLowerCase().includes('edit')).length,
          published: episodesProduced,
        },
        recentEpisodes: episodeProduction
          .filter(t => t.status === 'completed')
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
          .slice(0, 5)
          .map(t => ({
            title: t.title,
            completedAt: t.completedAt,
          })),
      };

      const insights = await this.generateAIInsights('podcast_analytics', reportData);

      const report: InsertReport = {
        type: 'podcast_analytics',
        title: `Podcast Analytics - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        context: 'podcast',
        content: {
          ...reportData,
          aiInsights: insights,
        },
        dateRange: { start: startDate, end: endDate },
      };

      const savedReport = await storage.createReport(report);
      return savedReport;
    } catch (error) {
      logger.error('Failed to generate podcast report', error);
      throw error;
    }
  }

  async generateNotromRevenueReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const allRevenues = await storage.getRevenues();
      const notromRevenue = allRevenues.filter(r => 
        r.type === 'notrom_project' && 
        new Date(r.receivedAt) >= startDate && 
        new Date(r.receivedAt) <= endDate
      );

      const allProjects = await storage.getProjects();
      const notromProjects = allProjects.filter(p => 
        p.createdAt && 
        new Date(p.createdAt) >= startDate && 
        new Date(p.createdAt) <= endDate
      );

      const allClients = await storage.getClients();
      const notromClients = allClients.filter(c => 
        c.createdAt && 
        new Date(c.createdAt) >= startDate && 
        new Date(c.createdAt) <= endDate
      );

      const totalRevenue = notromRevenue.reduce((sum, r) => sum + r.amount, 0);
      const completedProjects = notromProjects.filter(p => p.status === 'completed').length;
      const averageProjectValue = completedProjects > 0 ? totalRevenue / completedProjects : 0;

      const reportData = {
        period: { start: startDate, end: endDate },
        metrics: {
          totalRevenue,
          completedProjects,
          activeProjects: notromProjects.filter(p => p.status === 'in_progress').length,
          newClients: notromClients.length,
          averageProjectValue: Math.round(averageProjectValue),
        },
        revenueBreakdown: notromRevenue.map(r => ({
          amount: r.amount,
          description: r.description,
          receivedAt: r.receivedAt,
          clientId: r.clientId,
        })),
        projectStatus: {
          completed: completedProjects,
          inProgress: notromProjects.filter(p => p.status === 'in_progress').length,
          planning: notromProjects.filter(p => p.status === 'planning').length,
          onHold: notromProjects.filter(p => p.status === 'on_hold').length,
        },
      };

      const insights = await this.generateAIInsights('notrom_revenue', reportData);

      const report: InsertReport = {
        type: 'notrom_revenue',
        title: `Notrom Revenue Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        context: 'notrom',
        content: {
          ...reportData,
          aiInsights: insights,
        },
        dateRange: { start: startDate, end: endDate },
      };

      const savedReport = await storage.createReport(report);
      return savedReport;
    } catch (error) {
      logger.error('Failed to generate Notrom revenue report', error);
      throw error;
    }
  }

  private async generateAIInsights(reportType: string, data: any): Promise<string[]> {
    try {
      const prompt = `Analyze this ${reportType} data and provide 3-5 key insights and recommendations:

${JSON.stringify(data, null, 2)}

Focus on:
1. Performance trends and patterns
2. Areas for improvement
3. Opportunities for growth
4. Risk factors to monitor
5. Actionable recommendations

Respond with JSON array of insights: ["insight1", "insight2", ...]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
      return result.insights || [];
    } catch (error) {
      logger.error('Failed to generate AI insights', error);
      return ['Analysis completed. Review the metrics above for key performance indicators.'];
    }
  }

  async getReports(context?: string, limit: number = 10): Promise<any[]> {
    return await storage.getReports(context, limit);
  }

  async getRevenueMetrics(context?: string): Promise<any> {
    return await storage.getRevenueMetrics(context);
  }
}

export const reportService = new ReportService();