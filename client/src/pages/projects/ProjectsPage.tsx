import { Link } from "wouter";
import { ProjectCardList } from "@/components/modules/projects/ProjectCardList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, Briefcase, FolderKanban, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

export default function ProjectsPage() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const notromProjects = projects.filter(p => !p.context || p.context === 'notrom');
  const dayJobProjects = projects.filter(p => p.context === 'day_job');
  const activeProjects = projects.filter(p => ['planning', 'onboarding', 'in_progress', 'review'].includes(p.status));
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="text-3xl">📁</span>
            Project Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track and manage projects across your business contexts
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/projects/new">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Project
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">{notromProjects.length}</p>
              <p className="text-sm text-blue-700">Notrom</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{dayJobProjects.length}</p>
              <p className="text-sm text-green-700">Day Job</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-900">{activeProjects.length}</p>
              <p className="text-sm text-orange-700">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-900">{completedProjects.length}</p>
              <p className="text-sm text-emerald-700">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Project Views */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            <span className="hidden sm:inline">All Projects</span>
            <span className="sm:hidden">All</span>
            <Badge variant="secondary" className="ml-2">
              {projects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Active</span>
            <span className="sm:hidden">Active</span>
            <Badge variant="secondary" className="ml-2">
              {activeProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notrom" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Notrom</span>
            <span className="sm:hidden">Notrom</span>
            <Badge variant="secondary" className="ml-2">
              {notromProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="day_job" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Day Job</span>
            <span className="sm:hidden">Day Job</span>
            <Badge variant="secondary" className="ml-2">
              {dayJobProjects.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              📂 <strong>All projects</strong> across both business contexts. Cards show progress, deadlines, and status at a glance.
            </p>
          </div>
          <ProjectCardList context="all" />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-900">Active Projects</h4>
                <p className="text-sm text-orange-700">
                  Projects currently in planning, onboarding, progress, or review stages
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {['planning', 'onboarding', 'in_progress', 'review'].map(status => {
              const statusProjects = projects.filter(p => p.status === status);
              if (statusProjects.length === 0) return null;
              
              return (
                <div key={status}>
                  <h3 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
                    {status === 'planning' && <span>📋</span>}
                    {status === 'onboarding' && <span>👋</span>}
                    {status === 'in_progress' && <span>🚧</span>}
                    {status === 'review' && <span>👀</span>}
                    {status.replace('_', ' ')} ({statusProjects.length})
                  </h3>
                  <ProjectCardList context="all" status={status} />
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="notrom" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Notrom Business Projects</h4>
                <p className="text-sm text-blue-700">
                  Web development side hustle - client websites, e-commerce, and digital solutions
                </p>
              </div>
            </div>
          </div>
          <ProjectCardList context="notrom" />
        </TabsContent>

        <TabsContent value="day_job" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Day Job Projects</h4>
                <p className="text-sm text-green-700">
                  Head of Talent Management at Socially Powerful - recruitment and HR projects
                </p>
              </div>
            </div>
          </div>
          <ProjectCardList context="day_job" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
