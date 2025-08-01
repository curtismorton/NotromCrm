import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";

interface NaturalLanguageTaskUpdateProps {
  task: Task;
  onUpdate?: () => void;
}

export const NaturalLanguageTaskUpdate = ({ task, onUpdate }: NaturalLanguageTaskUpdateProps) => {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const processUpdateMutation = useMutation({
    mutationFn: async () => {
      // First, process the natural language update to get structured data
      const processed = await api.post("/api/ai/process-task-update", {
        taskId: task.id,
        currentStatus: task.status,
        update: prompt
      });
      
      // Then, use the processed data to update the task
      return api.patch(`/api/tasks/${task.id}`, processed.updates);
    },
    onSuccess: async () => {
      toast({
        title: "Task updated",
        description: "Your task has been updated using natural language",
      });
      
      // Clear the prompt after successful update
      setPrompt("");
      
      // Invalidate related queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/tasks/${task.id}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks", { projectId: task.projectId }] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
      
      setIsProcessing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    processUpdateMutation.mutate();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">Natural Language Update</CardTitle>
        </div>
        <CardDescription>
          Update this task using natural language. For example, "Change status to in progress" or "Increase priority to high and add a deadline of next Friday".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="Type your update in natural language..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] mb-4"
          />
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!prompt.trim() || isProcessing || processUpdateMutation.isPending}
        >
          {isProcessing || processUpdateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Update Task
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};