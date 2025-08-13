import { useState } from "react";
import { Link } from "wouter";
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

export default function NotromWorkspace() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Building2 className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Notrom Business</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your dedicated workspace for web development business, client management, and project delivery
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Active Leads</p>
                  <p className="text-3xl font-bold text-blue-900">{notromLeads.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Projects</p>
                  <p className="text-3xl font-bold text-green-900">{notromProjects.length}</p>
                </div>
                <FolderKanban className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Revenue</p>
                  <p className="text-3xl font-bold text-purple-900">$0</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Tasks</p>
                  <p className="text-3xl font-bold text-orange-900">0</p>
                </div>
                <CheckSquare className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/notrom/pipeline">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
              <CardHeader className="text-center pb-4">
                <Workflow className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-xl">Sales Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Track leads through your sales process from contact to completion
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">{notromLeads.length} active leads</Badge>
                </div>
              </CardContent>
            </Card>
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