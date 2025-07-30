import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  Users,
  FileCheck,
  Building2,
  Briefcase
} from "lucide-react";
import { Link } from "wouter";
import { Project } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProjectCardListProps {
  context?: 'notrom' | 'day_job' | 'all';
  status?: string;
}

export function ProjectCardList({ context = 'all', status }: ProjectCardListProps) {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects.filter(project => {
    const contextMatch = context === 'all' || 
      (context === 'notrom' && (!project.context || project.context === 'notrom')) ||
      (context === 'day_job' && project.context === 'day_job');
    
    const statusMatch = !status || project.status === status;
    
    return contextMatch && statusMatch;
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      color: string; 
      icon: JSX.Element; 
      label: string;
      bgColor: string;
    }> = {
      'planning': {
        color: 'bg-blue-100 text-blue-800',
        icon: <Calendar className="w-4 h-4" />,
        label: 'Planning',
        bgColor: 'bg-blue-50 border-l-blue-500'
      },
      'onboarding': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Users className="w-4 h-4" />,
        label: 'Onboarding',
        bgColor: 'bg-yellow-50 border-l-yellow-500'
      },
      'in_progress': {
        color: 'bg-green-100 text-green-800',
        icon: <Play className="w-4 h-4" />,
        label: 'In Progress',
        bgColor: 'bg-green-50 border-l-green-500'
      },
      'review': {
        color: 'bg-purple-100 text-purple-800',
        icon: <FileCheck className="w-4 h-4" />,
        label: 'Review',
        bgColor: 'bg-purple-50 border-l-purple-500'
      },
      'completed': {
        color: 'bg-emerald-100 text-emerald-800',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Completed',
        bgColor: 'bg-emerald-50 border-l-emerald-500'
      },
      'on_hold': {
        color: 'bg-orange-100 text-orange-800',
        icon: <Pause className="w-4 h-4" />,
        label: 'On Hold',
        bgColor: 'bg-orange-50 border-l-orange-500'
      },
      'cancelled': {
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Cancelled',
        bgColor: 'bg-red-50 border-l-red-500'
      }
    };
    return configs[status] || configs['planning'];
  };

  const calculateProgress = (project: Project) => {
    // Simple progress calculation based on status
    const progressMap: Record<string, number> = {
      'planning': 10,
      'onboarding': 25,
      'in_progress': 60,
      'review': 85,
      'completed': 100,
      'on_hold': 45,
      'cancelled': 0
    };
    return progressMap[project.status] || 0;
  };

  const getContextColor = (projectContext?: string) => {
    return projectContext === 'day_job' ? 'border-l-green-500' : 'border-l-blue-500';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading projects...</div>;
  }

  if (filteredProjects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {context === 'all' 
              ? "You haven't created any projects yet." 
              : `No projects found for ${context === 'notrom' ? 'Notrom business' : 'day job'}.`}
          </p>
          <Button asChild>
            <Link href="/projects/new">Create Your First Project</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => {
          const statusConfig = getStatusConfig(project.status);
          const progress = calculateProgress(project);
          const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
          
          return (
            <Card key={project.id} className={cn(
              "h-full transition-all hover:shadow-md border-l-4",
              statusConfig.bgColor,
              getContextColor(project.context)
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold mb-2 line-clamp-2">
                      <Link href={`/projects/${project.id}`} className="hover:text-primary">
                        {project.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={statusConfig.color} variant="secondary">
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.label}</span>
                      </Badge>
                      <span className="text-xs">
                        {project.context === 'day_job' ? '💼' : '🏢'}
                      </span>
                    </div>
                  </div>
                  {isOverdue && (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Project Description */}
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Key Information */}
                <div className="space-y-2">
                  {project.startDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Started:</span>
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {project.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium text-green-600">
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {project.contractSigned && (
                    <Badge variant="outline" className="text-xs">
                      📄 Contract Signed
                    </Badge>
                  )}
                  {project.completedDate && (
                    <Badge variant="outline" className="text-xs">
                      ✅ Completed {new Date(project.completedDate).toLocaleDateString()}
                    </Badge>
                  )}
                  {project.status === 'on_hold' && (
                    <Badge variant="outline" className="text-xs text-orange-600">
                      ⏸️ On Hold
                    </Badge>
                  )}
                </div>

                {/* Context Indicator */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  {project.context === 'day_job' ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Briefcase className="w-4 h-4" />
                      <span>Day Job Project</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Building2 className="w-4 h-4" />
                      <span>Notrom Business</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/projects/${project.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}