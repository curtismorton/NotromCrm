import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, ArrowDownToLine, Loader2 } from "lucide-react";

interface TaskSuggestionsProps {
  project: Project;
  onAddTask?: (task: any) => void;
}

export const TaskSuggestions = ({ project, onAddTask }: TaskSuggestionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestionsMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", "/api/ai/generate-task-suggestions", {
        projectName: project.name,
        projectDescription: project.description || `${project.name} project`,
      });
    },
    onSuccess: (data) => {
      if (data && data.tasks && Array.isArray(data.tasks)) {
        setSuggestions(data.tasks);
        toast({
          title: "Task suggestions generated",
          description: `Generated ${data.tasks.length} task suggestions for this project`,
        });
      } else {
        console.error("Unexpected response format:", data);
        toast({
          title: "Error",
          description: "Received unexpected response format from AI service",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error generating task suggestions:", error);
      toast({
        title: "Error",
        description: `Failed to generate task suggestions: ${error.message}`,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (task: any) => {
      return apiRequest("POST", "/api/tasks", {
        title: task.title,
        description: task.description || "",
        status: "todo",
        priority: task.priority || "medium",
        projectId: project.id,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      });
    },
    onSuccess: async () => {
      toast({
        title: "Task added",
        description: "Suggested task has been added to the project",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks", { projectId: project.id }] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      if (onAddTask) {
        onAddTask(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerateSuggestions = () => {
    setIsLoading(true);
    generateSuggestionsMutation.mutate();
  };

  const handleAddTask = (task: any) => {
    addTaskMutation.mutate(task);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <BrainCircuit className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">AI Task Suggestions</CardTitle>
        </div>
        <CardDescription>
          Use AI to automatically generate task suggestions based on the project description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              {suggestions.map((task, index) => (
                <div 
                  key={index} 
                  className="bg-slate-50 p-3 rounded-md border hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                      {task.priority && (
                        <div className="text-xs text-slate-500 mt-2">
                          Priority: <span className="font-medium">{task.priority}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="ml-2 flex-shrink-0"
                      onClick={() => handleAddTask(task)}
                      disabled={addTaskMutation.isPending}
                    >
                      <ArrowDownToLine className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGenerateSuggestions}
              disabled={isLoading || generateSuggestionsMutation.isPending}
            >
              {isLoading || generateSuggestionsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <BrainCircuit className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-slate-700 mb-2">No Task Suggestions Yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              Generate AI task suggestions based on the project description and goals.
            </p>
            <Button
              onClick={handleGenerateSuggestions}
              disabled={isLoading || generateSuggestionsMutation.isPending}
            >
              {isLoading || generateSuggestionsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Task Suggestions
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};