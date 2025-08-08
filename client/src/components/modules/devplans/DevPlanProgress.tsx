import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type DevPlan, type Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Hammer,
  FileEdit,
  Rocket,
  ChevronRight,
  Calendar,
  ClipboardCheck,
  Clock10
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format, differenceInDays, isBefore, isAfter } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { logger } from "../../../../../server/utils/logger";

interface DevPlanProgressProps {
  project: Project;
  onUpdateStage?: (plan: DevPlan) => void;
}

export const DevPlanProgress = ({ project, onUpdateStage }: DevPlanProgressProps) => {
  const { toast } = useToast();
  const [updatingStage, setUpdatingStage] = useState<string | null>(null);

  // Fetch the dev plan associated with this project
  const { data: devPlan, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/projects", project.id, "dev-plan"],
    retry: false,
    enabled: !!project.id,
    throwOnError: false
  });

  // Error handling
  useEffect(() => {
    if (error) {
      logger.error("Error fetching dev plan:", error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Development Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 items-center justify-center py-8">
            <div className="text-center text-muted-foreground">Loading development plan...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!devPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Development Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 items-center justify-center py-8">
            <div className="text-center">No development plan exists for this project yet.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage for the current stage
  const calculateStageProgress = (plan: DevPlan): number => {
    const stage = plan.currentStage;
    let progress = 0;

    const now = new Date();

    switch (stage) {
      case "planning":
        if (plan.planningStartDate && plan.planningEndDate) {
          const startDate = new Date(plan.planningStartDate);
          const endDate = new Date(plan.planningEndDate);
          const totalDays = differenceInDays(endDate, startDate);
          const daysPassed = differenceInDays(now, startDate);
          
          if (isBefore(now, startDate)) {
            progress = 0;
          } else if (isAfter(now, endDate)) {
            progress = 100;
          } else {
            progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);
          }
        }
        break;
      case "build":
        if (plan.buildStartDate && plan.buildEndDate) {
          const startDate = new Date(plan.buildStartDate);
          const endDate = new Date(plan.buildEndDate);
          const totalDays = differenceInDays(endDate, startDate);
          const daysPassed = differenceInDays(now, startDate);
          
          if (isBefore(now, startDate)) {
            progress = 0;
          } else if (isAfter(now, endDate)) {
            progress = 100;
          } else {
            progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);
          }
        }
        break;
      case "revise":
        if (plan.reviseStartDate && plan.reviseEndDate) {
          const startDate = new Date(plan.reviseStartDate);
          const endDate = new Date(plan.reviseEndDate);
          const totalDays = differenceInDays(endDate, startDate);
          const daysPassed = differenceInDays(now, startDate);
          
          if (isBefore(now, startDate)) {
            progress = 0;
          } else if (isAfter(now, endDate)) {
            progress = 100;
          } else {
            progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);
          }
        }
        break;
      case "live":
        progress = 100; // Always 100% for live stage
        break;
    }

    return progress;
  };

  // Get stage number (1-4)
  const getStageNumber = (stage: string): number => {
    switch (stage) {
      case "planning": return 1;
      case "build": return 2;
      case "revise": return 3;
      case "live": return 4;
      default: return 1;
    }
  };

  // Function to advance to the next stage
  const handleAdvanceStage = async (currentStage: string) => {
    setUpdatingStage(currentStage);
    
    let nextStage;
    let startDate = new Date();
    let endDate;
    
    // Determine the next stage
    switch (currentStage) {
      case "planning":
        nextStage = "build";
        // Set default end date to 30 days from now for build stage
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        break;
      case "build":
        nextStage = "revise";
        // Set default end date to 14 days from now for revise stage
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 14);
        break;
      case "revise":
        nextStage = "live";
        // No end date for live stage
        break;
      default:
        nextStage = "planning";
        // Set default end date to 14 days from now for planning stage
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 14);
    }
    
    try {
      const updatedPlan = await apiRequest(`/api/dev-plans/${devPlan.id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({
          stage: nextStage,
          startDate,
          endDate: nextStage !== "live" ? endDate : undefined
        }),
      });
      
      refetch();
      
      toast({
        title: "Stage updated",
        description: `Development plan moved to ${nextStage} stage.`,
      });
      
      if (onUpdateStage && updatedPlan) {
        onUpdateStage(updatedPlan);
      }
    } catch (error) {
      logger.error("Error updating stage:", error);
      toast({
        title: "Error",
        description: "Failed to update development stage.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStage(null);
    }
  };

  const stageProgress = calculateStageProgress(devPlan);
  const currentStageNumber = getStageNumber(devPlan.currentStage);

  // Stage configuration
  const stages = [
    { 
      id: "planning", 
      name: "Planning", 
      icon: ClipboardList, 
      color: "bg-blue-500",
      textColor: "text-blue-500",
      borderColor: "border-blue-500",
      active: devPlan.currentStage === "planning",
      completed: currentStageNumber > 1,
      startDate: devPlan.planningStartDate,
      endDate: devPlan.planningEndDate,
      notes: devPlan.planningNotes
    },
    { 
      id: "build", 
      name: "Build", 
      icon: Hammer, 
      color: "bg-amber-500",
      textColor: "text-amber-500",
      borderColor: "border-amber-500",
      active: devPlan.currentStage === "build",
      completed: currentStageNumber > 2,
      startDate: devPlan.buildStartDate,
      endDate: devPlan.buildEndDate,
      notes: devPlan.buildNotes
    },
    { 
      id: "revise", 
      name: "Revise", 
      icon: FileEdit, 
      color: "bg-purple-500",
      textColor: "text-purple-500",
      borderColor: "border-purple-500",
      active: devPlan.currentStage === "revise",
      completed: currentStageNumber > 3,
      startDate: devPlan.reviseStartDate,
      endDate: devPlan.reviseEndDate,
      notes: devPlan.reviseNotes
    },
    { 
      id: "live", 
      name: "Live", 
      icon: Rocket, 
      color: "bg-green-500",
      textColor: "text-green-500",
      borderColor: "border-green-500",
      active: devPlan.currentStage === "live",
      completed: false,
      startDate: devPlan.liveStartDate,
      endDate: null,
      notes: devPlan.liveNotes
    }
  ];

  // Calculate overall progress (completed stages / total stages)
  const overallProgress = Math.round(((currentStageNumber - 1) * 100 + stageProgress) / 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5" />
            <span>Development Plan: {devPlan.name}</span>
          </div>
          <Badge>{devPlan.currentStage.charAt(0).toUpperCase() + devPlan.currentStage.slice(1)}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
        
        <div className="space-y-8">
          {stages.map((stage, index) => {
            const StageIcon = stage.icon;
            const nextStageIndex = stages.findIndex(s => s.id === devPlan.currentStage) + 1;
            const isNextStage = index === nextStageIndex && index < stages.length;
            
            return (
              <div key={stage.id} className="relative">
                {/* Stage connector line */}
                {index < stages.length - 1 && (
                  <div 
                    className={`absolute top-7 left-4 w-0.5 h-[calc(100%+2rem)] -z-10 ${
                      stage.completed ? stage.color : "bg-gray-200"
                    }`} 
                  />
                )}
                
                <div className="flex">
                  {/* Stage indicator */}
                  <div className="mr-4">
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        stage.completed 
                          ? "bg-white text-white " + stage.color
                          : stage.active 
                            ? "border-2 " + stage.borderColor + " " + stage.textColor
                            : "border-2 border-gray-200 text-gray-400"
                      }`}
                    >
                      <StageIcon className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Stage content */}
                  <div className="flex-1">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          stage.active ? stage.textColor : stage.completed ? "text-gray-900" : "text-gray-500"
                        }`}>
                          {stage.name}
                        </h3>
                        
                        {/* Dates display */}
                        {(stage.startDate || stage.endDate) && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {stage.startDate && format(new Date(stage.startDate), "MMM d, yyyy")}
                            {stage.startDate && stage.endDate && " - "}
                            {stage.endDate && format(new Date(stage.endDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                      
                      {/* Stage progress when active */}
                      {stage.active && (
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium">Progress</span>
                            <span className="text-xs font-medium">{stageProgress}%</span>
                          </div>
                          <Progress value={stageProgress} className={`h-1.5 ${stage.color}`} />
                        </div>
                      )}
                      
                      {/* Stage notes if available */}
                      {stage.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {stage.notes}
                        </div>
                      )}
                      
                      {/* Advance stage button */}
                      {stage.active && !stage.completed && stage.id !== "live" && (
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`${stage.borderColor} ${stage.textColor}`}
                            onClick={() => handleAdvanceStage(stage.id)}
                            disabled={!!updatingStage}
                          >
                            {updatingStage === stage.id ? "Updating..." : "Advance to Next Stage"}
                            <ChevronRight className="ml-1 w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Next stage indicator */}
                      {isNextStage && !stage.active && !stage.completed && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <Clock10 className="w-3 h-3 mr-1" />
                          <span>Up next</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};