import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Project, Tag } from "@shared/schema";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Helper function to get project status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    case 'onboarding':
      return 'bg-teal-100 text-teal-800';
    case 'in_progress':
      return 'bg-amber-100 text-amber-800';
    case 'review':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'on_hold':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to generate project tags
const generateProjectTags = (project: Project) => {
  const tags = [];
  
  // Design stage tags
  if (project.status === 'planning') {
    tags.push({ name: 'Planning', color: 'bg-blue-50 text-blue-700' });
  }

  // Content tags
  if (project.status === 'onboarding') {
    tags.push({ name: 'Onboarding', color: 'bg-amber-50 text-amber-700' });
  }

  // Review tags
  if (project.status === 'review') {
    tags.push({ name: 'In Review', color: 'bg-purple-50 text-purple-700' });
  }

  // Contract tags
  if (!project.contractSigned && (project.status === 'planning' || project.status === 'onboarding')) {
    tags.push({ name: 'Contract Pending', color: 'bg-red-50 text-red-700' });
  }
  
  // Deadline tags
  if (project.deadline && new Date(project.deadline) < new Date() && 
      project.status !== 'completed' && project.status !== 'cancelled') {
    tags.push({ name: 'Deadline Passed', color: 'bg-red-50 text-red-700' });
  }

  return tags;
};

export const ProjectSummaryStrip = () => {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Prioritize active projects
  const activeProjects = projects.filter(
    project => project.status !== 'completed' && project.status !== 'cancelled'
  ).sort((a, b) => {
    // Sort by status priority
    const statusPriority: Record<string, number> = {
      'review': 1,
      'in_progress': 2,
      'onboarding': 3,
      'planning': 4,
      'on_hold': 5
    };
    
    return (statusPriority[a.status] || 999) - (statusPriority[b.status] || 999);
  });

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <FolderKanban className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-lg">Project Summary</CardTitle>
          </div>
          <CardDescription>
            Quick overview of your active projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-slate-600">No active projects found</p>
            <Button className="mt-3" size="sm" asChild>
              <Link href="/projects/new">Create New Project</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderKanban className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-lg">Project Summary</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Quick overview of your active projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeProjects.slice(0, 5).map(project => {
            const projectTags = generateProjectTags(project);
            
            return (
              <div 
                key={project.id} 
                className="border rounded-md p-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/projects/${project.id}`}>
                    <h3 className="font-medium text-primary hover:text-primary/80 transition-colors">
                      {project.name}
                    </h3>
                  </Link>
                  <Badge 
                    className={cn(
                      "text-xs",
                      getStatusColor(project.status)
                    )}
                  >
                    {project.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                
                {project.deadline && (
                  <div className="flex items-center text-xs text-slate-500 mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Due: {new Date(project.deadline).toLocaleDateString()}
                    {new Date(project.deadline) < new Date() && project.status !== 'completed' && (
                      <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-700">
                        Overdue
                      </Badge>
                    )}
                  </div>
                )}
                
                {projectTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {projectTags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={tag.color}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-slate-500 mt-2">
                  {project.clientId ? (
                    <span>Client: {project.clientName || 'Client #' + project.clientId}</span>
                  ) : project.leadId ? (
                    <span>Lead: {project.leadName || 'Lead #' + project.leadId}</span>
                  ) : (
                    <span>No client assigned</span>
                  )}
                </div>
              </div>
            );
          })}
          
          {activeProjects.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/projects">
                  View {activeProjects.length - 5} more projects
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};