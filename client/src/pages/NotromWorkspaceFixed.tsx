import { useState } from "react";
import { Link, useLocation, Switch, Route } from "wouter";
import { 
  Building2, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  Workflow,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function NotromDashboard() {
  const { data: stats } = useQuery<{
    totalLeads: number;
    activeProjects: number;
    totalClients: number;
    totalTasks: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ["/api/leads"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"], 
  });

  // Filter for Notrom-specific data
  const notromLeads = leads.filter((lead: any) => lead.context === 'notrom');
  const notromProjects = projects.filter((project: any) => project.context === 'notrom');

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Notrom Business</h1>
          <p className="text-meta">Your dedicated workspace for web development business, client management, and project delivery.</p>
        </div>
        <div className="flex items-center gap-12">
          <Building2 className="w-8 h-8" style={{ color: 'var(--action-cyan-500)' }} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-24">
        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Active Leads</p>
                <p className="text-3xl font-bold text-ink-200">{notromLeads.length}</p>
              </div>
              <Users className="w-8 h-8" style={{ color: 'var(--action-cyan-500)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Projects</p>
                <p className="text-3xl font-bold text-ink-200">{notromProjects.length}</p>
              </div>
              <FolderKanban className="w-8 h-8" style={{ color: 'var(--ok-500)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Revenue</p>
                <p className="text-3xl font-bold text-ink-200">$0</p>
              </div>
              <DollarSign className="w-8 h-8" style={{ color: 'var(--warn-500)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Tasks</p>
                <p className="text-3xl font-bold text-ink-200">0</p>
              </div>
              <CheckSquare className="w-8 h-8" style={{ color: 'var(--danger-500)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
        <Link href="/notrom/pipeline">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Workflow className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--action-cyan-500)' }} />
              <h3 className="card__title">Sales Pipeline</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Track leads through your sales process from contact to completion
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">{notromLeads.length} active leads</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/notrom/projects">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <FolderKanban className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--ok-500)' }} />
              <h3 className="card__title">Project Management</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Manage web development projects from planning to delivery
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">{notromProjects.length} projects</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/notrom/clients">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Building2 className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--warn-500)' }} />
              <h3 className="card__title">Client Management</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Maintain relationships and track client information
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">{stats?.totalClients || 0} clients</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/notrom/revenue">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--warn-500)' }} />
              <h3 className="card__title">Revenue Tracking</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Monitor income, expenses, and business profitability
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">$0 revenue</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/notrom/tasks">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <CheckSquare className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--danger-500)' }} />
              <h3 className="card__title">Business Tasks</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Manage client work, deadlines, and business operations
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">0 tasks</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/calendar">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <CalendarDays className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--action-cyan-500)' }} />
              <h3 className="card__title">Calendar & Schedule</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Schedule meetings, deadlines, and important business events
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">View Schedule</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function NotromWorkspaceFixed() {
  return <NotromDashboard />;
}