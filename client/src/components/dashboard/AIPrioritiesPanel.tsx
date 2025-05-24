import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Lead, Project, Task } from "@shared/schema";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export const AIPrioritiesPanel = () => {
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // AI-powered priority calculation
  const pendingLeads = leads.filter(lead => 
    lead.status === "new" || lead.status === "contacted"
  );
  
  const projectsInReview = projects.filter(project => 
    project.status === "review"
  );
  
  const projectsWithDeadlines = projects.filter(project => 
    project.deadline && new Date(project.deadline) < new Date() && 
    project.status !== "completed" && project.status !== "cancelled"
  );
  
  const overdueDeadlineTasks = tasks.filter(task => 
    task.status !== "completed" && 
    task.dueDate && new Date(task.dueDate) < new Date()
  );
  
  const highPriorityTasks = tasks.filter(task => 
    task.status !== "completed" && 
    task.priority === "high"
  );

  // Generate AI-powered insights
  const hasHighPriorityItems = pendingLeads.length > 0 || 
    projectsInReview.length > 0 || 
    projectsWithDeadlines.length > 0 || 
    overdueDeadlineTasks.length > 0 ||
    highPriorityTasks.length > 0;

  return (
    <Card className={cn(
      "transition-all duration-200",
      hasHighPriorityItems ? "border-amber-300 shadow-md" : ""
    )}>
      <CardHeader className={cn(
        "pb-2",
        hasHighPriorityItems ? "bg-gradient-to-r from-amber-50 to-transparent" : ""
      )}>
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
          <CardTitle className="text-lg">AI Priority Insights</CardTitle>
        </div>
        <CardDescription>
          AI-powered recommendations for your attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasHighPriorityItems ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <p className="text-slate-600">Great job! You're all caught up.</p>
            <p className="text-sm text-slate-500 mt-1">
              There are no urgent items requiring your attention right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeads.length > 0 && (
              <div className="border-l-4 border-blue-400 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Lead Follow-ups Needed</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      You have {pendingLeads.length} lead{pendingLeads.length > 1 ? 's' : ''} that need{pendingLeads.length === 1 ? 's' : ''} follow-up
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/leads">
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {pendingLeads.length <= 3 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pendingLeads.map(lead => (
                      <Badge key={lead.id} variant="outline" className="bg-blue-50">
                        {lead.companyName}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {projectsInReview.length > 0 && (
              <div className="border-l-4 border-purple-400 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Projects In Review</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {projectsInReview.length} project{projectsInReview.length > 1 ? 's' : ''} need{projectsInReview.length === 1 ? 's' : ''} review before proceeding
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects">
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {projectsWithDeadlines.length > 0 && (
              <div className="border-l-4 border-red-400 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Deadline Alert</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {projectsWithDeadlines.length} project{projectsWithDeadlines.length > 1 ? 's are' : ' is'} past deadline
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects">
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {overdueDeadlineTasks.length > 0 && (
              <div className="border-l-4 border-amber-400 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Overdue Tasks</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {overdueDeadlineTasks.length} task{overdueDeadlineTasks.length > 1 ? 's are' : ' is'} past the deadline
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {highPriorityTasks.length > 0 && (
              <div className="border-l-4 border-orange-400 pl-3 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">High Priority Tasks</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {highPriorityTasks.length} high priority task{highPriorityTasks.length > 1 ? 's' : ''} need{highPriorityTasks.length === 1 ? 's' : ''} attention
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tasks">
                      View <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};