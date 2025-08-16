import { useState } from "react";
import { Link, useLocation, Switch, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useWorkspace } from "@/hooks/use-workspace";

// Import individual pages
import LeadsPage from "@/pages/leads/LeadsPage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ClientsPage from "@/pages/clients/ClientsPage";
import PipelinePage from "@/pages/PipelinePage";
import NotromTasksPage from "@/pages/NotromTasksPage";
import RevenuePage from "@/pages/RevenuePage";
import CalendarPage from "@/pages/CalendarPage";

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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
              <CardHeader className="text-center pb-4">
                <FolderKanban className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <CardTitle className="text-xl">Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Manage web development projects from planning to delivery
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">{notromProjects.length} projects</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notrom/clients">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300">
              <CardHeader className="text-center pb-4">
                <Building2 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <CardTitle className="text-xl">Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Maintain relationships and track client information
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">{stats?.totalClients || 0} clients</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notrom/tasks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-300">
              <CardHeader className="text-center pb-4">
                <CheckSquare className="w-16 h-16 mx-auto text-orange-600 mb-4" />
                <CardTitle className="text-xl">Business Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Manage business-related tasks and deliverables
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 tasks</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notrom/revenue">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300">
              <CardHeader className="text-center pb-4">
                <TrendingUp className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
                <CardTitle className="text-xl">Revenue Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Monitor business income and financial performance
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">$0 this month</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/notrom/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-indigo-300">
              <CardHeader className="text-center pb-4">
                <CalendarDays className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
                <CardTitle className="text-xl">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  View deadlines, meetings, and important business dates
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 events today</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            New Lead
          </Button>
          <Button size="lg" variant="outline">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NotromWorkspace() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/notrom" component={NotromDashboard} />
      <Route path="/notrom/leads" component={LeadsPage} />
      <Route path="/notrom/leads/:id" component={LeadsPage} />
      <Route path="/notrom/projects" component={ProjectsPage} />
      <Route path="/notrom/projects/:id" component={ProjectsPage} />
      <Route path="/notrom/clients" component={ClientsPage} />
      <Route path="/notrom/clients/:id" component={ClientsPage} />
      <Route path="/notrom/pipeline" component={PipelinePage} />
      <Route path="/notrom/tasks" component={NotromTasksPage} />
      <Route path="/notrom/revenue" component={RevenuePage} />
      <Route path="/notrom/calendar" component={CalendarPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/clients" component={ClientsPage} />
      <Route path="/pipeline" component={PipelinePage} />
      <Route component={NotromDashboard} />
    </Switch>
  );
}