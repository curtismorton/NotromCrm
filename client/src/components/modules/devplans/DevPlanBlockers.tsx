import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type DevPlan, type Project, type Task } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { logger } from "../../../../../server/utils/logger";

interface DevPlanBlockersProps {
  project: Project;
  tasks?: Task[];
  devPlan?: DevPlan;
}

export const DevPlanBlockers = ({ project, tasks = [], devPlan }: DevPlanBlockersProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Fetch analysis from the AI service
  const { data: blockers, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/projects", project.id, "blockers"],
    enabled: false, // Don't run automatically, user must click button
  });

  const handleAnalyzeBlockers = async () => {
    setIsAnalyzing(true);
    try {
      await refetch();
      toast({
        title: "Analysis complete",
        description: "Potential blockers have been identified.",
      });
    } catch (error) {
      logger.error("Error analyzing blockers:", error);
      toast({
        title: "Analysis failed",
        description: "There was a problem identifying blockers.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Determine potential blockers based on project and task data
  const identifyManualBlockers = () => {
    const manualBlockers = [];
    
    // Check for missing deadline
    if (!project.deadline) {
      manualBlockers.push({
        type: "missingDeadline",
        description: "Project has no deadline set, which may affect planning and timeline management."
      });
    }
    
    // Check for tasks without assignees
    const unassignedTasks = tasks.filter(task => !task.assignedTo);
    if (unassignedTasks.length > 0) {
      manualBlockers.push({
        type: "unassignedTasks",
        description: `${unassignedTasks.length} tasks have no assignee, which may delay progress.`,
        count: unassignedTasks.length
      });
    }
    
    // Check for tasks without due dates
    const tasksWithoutDueDate = tasks.filter(task => !task.dueDate);
    if (tasksWithoutDueDate.length > 0) {
      manualBlockers.push({
        type: "missingDueDates",
        description: `${tasksWithoutDueDate.length} tasks have no due date, making it difficult to track progress.`,
        count: tasksWithoutDueDate.length
      });
    }
    
    // Check for incomplete tasks with past due dates
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.status !== "completed" && 
      task.dueDate && 
      new Date(task.dueDate) < now
    );
    if (overdueTasks.length > 0) {
      manualBlockers.push({
        type: "overdueTasks",
        description: `${overdueTasks.length} tasks are overdue, which may impact the timeline.`,
        count: overdueTasks.length
      });
    }
    
    // Check for dev plan specific blockers
    if (devPlan) {
      // Current stage is planning but no planning end date
      if (devPlan.currentStage === "planning" && !devPlan.planningEndDate) {
        manualBlockers.push({
          type: "missingPlanningEndDate",
          description: "Planning stage has no end date, making it difficult to track progress."
        });
      }
      
      // Current stage is build but no build end date
      if (devPlan.currentStage === "build" && !devPlan.buildEndDate) {
        manualBlockers.push({
          type: "missingBuildEndDate",
          description: "Build stage has no end date, making it difficult to track progress."
        });
      }
      
      // Current stage is revise but no revise end date
      if (devPlan.currentStage === "revise" && !devPlan.reviseEndDate) {
        manualBlockers.push({
          type: "missingReviseEndDate",
          description: "Revise stage has no end date, making it difficult to track progress."
        });
      }
    }
    
    return manualBlockers;
  };
  
  const manualBlockers = identifyManualBlockers();
  const hasManualBlockers = manualBlockers.length > 0;
  const hasAiBlockers = blockers && blockers.length > 0;
  
  // Combine AI and manual blockers
  const allBlockers = [
    ...(blockers || []),
    ...manualBlockers
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
            <span>Potential Blockers</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Analyzing project for potential blockers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-500">Error analyzing blockers. Please try again.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allBlockers.length > 0 ? (
              <ul className="space-y-3">
                {allBlockers.map((blocker, index) => (
                  <li key={index} className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm text-amber-800">{blocker.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  {hasAiBlockers === false ? 
                    "No blockers have been identified yet. Click the button below to run an AI analysis." : 
                    "No potential blockers found. Your project is on track!"}
                </p>
              </div>
            )}
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAnalyzeBlockers}
                disabled={isAnalyzing}
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                <RefreshCwIcon className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? "Analyzing..." : hasAiBlockers ? "Re-analyze Blockers" : "Analyze Blockers"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};