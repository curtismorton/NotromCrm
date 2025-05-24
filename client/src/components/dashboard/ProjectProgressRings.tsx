import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, Task } from "@shared/schema";
import { PieChart, BarChart, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Progress Ring Component
const ProgressRing = ({ 
  percentage, 
  size = 80, 
  strokeWidth = 8, 
  color = "text-primary"
}: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          className="text-gray-200"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          className={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
        {percentage}%
      </div>
    </div>
  );
};

export const ProjectProgressRings = () => {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Get only active projects
  const activeProjects = projects.filter(project => 
    project.status === "in_progress" || 
    project.status === "planning" || 
    project.status === "review"
  );

  // Calculate project progress based on completed tasks
  const projectProgress = activeProjects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.status === "completed");
    
    let progressPercentage = 0;
    if (projectTasks.length > 0) {
      progressPercentage = Math.round((completedTasks.length / projectTasks.length) * 100);
    }

    // Calculate color based on progress
    let ringColor = "text-amber-500";
    if (progressPercentage >= 75) {
      ringColor = "text-green-500";
    } else if (progressPercentage >= 25) {
      ringColor = "text-blue-500";
    }

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      progress: progressPercentage,
      ringColor,
      taskCount: projectTasks.length,
      completedTaskCount: completedTasks.length
    };
  });

  // Sort by progress (ascending)
  projectProgress.sort((a, b) => a.progress - b.progress);

  // Calculate overall progress across all active projects
  const overallProgress = projectProgress.length > 0
    ? Math.round(projectProgress.reduce((sum, p) => sum + p.progress, 0) / projectProgress.length)
    : 0;

  // Count projects by progress category
  const earlyStageProjects = projectProgress.filter(p => p.progress < 25).length;
  const midStageProjects = projectProgress.filter(p => p.progress >= 25 && p.progress < 75).length;
  const lateStageProjects = projectProgress.filter(p => p.progress >= 75 && p.progress < 100).length;
  const completedProjects = projectProgress.filter(p => p.progress === 100).length;

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <PieChart className="h-5 w-5 text-primary mr-2" />
            <CardTitle className="text-lg">Project Progress</CardTitle>
          </div>
          <CardDescription>
            Track completion status across projects
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center py-6">
            <p className="text-slate-600">No active projects to track</p>
            <Link href="/projects/new" className="text-primary text-sm mt-2 flex items-center justify-center">
              Create a project <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <PieChart className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Project Progress</CardTitle>
        </div>
        <CardDescription>
          Track completion status across {activeProjects.length} active projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-4">
          <ProgressRing 
            percentage={overallProgress} 
            size={100} 
            strokeWidth={10} 
            color={
              overallProgress >= 75 ? "text-green-500" :
              overallProgress >= 25 ? "text-blue-500" :
              "text-amber-500"
            } 
          />
          <h3 className="mt-2 font-medium">Overall Progress</h3>
          <p className="text-sm text-slate-500">
            {earlyStageProjects > 0 && `${earlyStageProjects} early stage`}
            {earlyStageProjects > 0 && (midStageProjects > 0 || lateStageProjects > 0) && ", "}
            {midStageProjects > 0 && `${midStageProjects} mid stage`}
            {midStageProjects > 0 && lateStageProjects > 0 && ", "}
            {lateStageProjects > 0 && `${lateStageProjects} late stage`}
            {completedProjects > 0 && `, ${completedProjects} completed`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {projectProgress.slice(0, 6).map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="flex flex-col items-center p-2 hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
                <ProgressRing 
                  percentage={project.progress} 
                  size={60} 
                  strokeWidth={6} 
                  color={project.ringColor} 
                />
                <h4 className="mt-2 text-sm font-medium text-center line-clamp-1" title={project.name}>
                  {project.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {project.completedTaskCount}/{project.taskCount} tasks
                </p>
              </div>
            </Link>
          ))}
        </div>

        {projectProgress.length > 6 && (
          <div className="text-center mt-4">
            <Link href="/projects" className="text-primary text-sm flex items-center justify-center">
              View all {projectProgress.length} projects <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};