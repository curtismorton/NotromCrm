import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Sparkles, Loader2 } from "lucide-react";

interface AIAssistantProps {
  context?: string;
  contextType: "task" | "project" | "client" | "lead";
  contextId?: number;
  placeholder?: string;
  title?: string;
  description?: string;
  onSuggestionSelect?: (suggestion: any) => void;
}

export const AIAssistant = ({
  context,
  contextType,
  contextId,
  placeholder = "Ask me anything about this...",
  title = "AI Assistant",
  description = "I can help you with tasks, projects, clients, and more. Just tell me what you need.",
  onSuggestionSelect
}: AIAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const [aiResponse, setAiResponse] = useState<any>(null);

  const aiMutation = useMutation({
    mutationFn: async (data: { prompt: string }) => {
      let endpoint = "/api/ai/task-advice";
      let payload = {};

      switch (contextType) {
        case "task":
          endpoint = "/api/ai/task-advice";
          payload = {
            taskDescription: context,
            taskStatus: "in_progress",
            prompt: data.prompt
          };
          break;
        case "project":
          endpoint = "/api/ai/generate-task-suggestions";
          payload = {
            projectName: "Current Project",
            projectDescription: context,
            prompt: data.prompt
          };
          break;
        case "client":
          endpoint = "/api/ai/client-insights";
          payload = {
            clientData: context,
            prompt: data.prompt
          };
          break;
        case "lead":
          endpoint = "/api/ai/search-prospective-clients";
          payload = {
            industry: "Technology",
            criteria: data.prompt
          };
          break;
      }

      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: (data) => {
      setAiResponse(data);
      toast({
        title: "AI response received",
        description: "The AI has processed your request",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to get AI response: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const naturalLanguageUpdateMutation = useMutation({
    mutationFn: (data: { taskId: number; currentStatus: string; update: string }) => {
      return apiRequest("POST", "/api/ai/process-task-update", data);
    },
    onSuccess: (data) => {
      setAiResponse(data);
      toast({
        title: "Task updated",
        description: "Your task has been updated using natural language",
      });
      if (onSuggestionSelect) {
        onSuggestionSelect(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // For task updates, use the natural language update endpoint
    if (contextType === "task" && contextId) {
      naturalLanguageUpdateMutation.mutate({
        taskId: contextId,
        currentStatus: "in_progress", // This would come from the actual task
        update: prompt
      });
    } else {
      aiMutation.mutate({ prompt });
    }
  };

  const renderAIResponse = () => {
    if (!aiResponse) return null;

    if (contextType === "project" && aiResponse.tasks) {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">Suggested Tasks:</h3>
          <ul className="space-y-2">
            {aiResponse.tasks.map((task: any, index: number) => (
              <li key={index} className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => onSuggestionSelect && onSuggestionSelect(task)}>
                <div className="flex items-start">
                  <Sparkles className="text-amber-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (contextType === "client" && aiResponse.insights) {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">Client Insights:</h3>
          <div className="bg-slate-50 p-3 rounded-md">
            <p className="text-sm">{aiResponse.insights}</p>
          </div>
        </div>
      );
    }

    if (contextType === "lead" && aiResponse.prospects) {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">Prospective Clients:</h3>
          <ul className="space-y-2">
            {aiResponse.prospects.map((prospect: any, index: number) => (
              <li key={index} className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => onSuggestionSelect && onSuggestionSelect(prospect)}>
                <p className="font-medium">{prospect.name}</p>
                <p className="text-sm text-gray-600">{prospect.description}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // For task advice
    return (
      <div className="mt-4">
        <h3 className="font-medium text-sm">AI Advice:</h3>
        <div className="bg-slate-50 p-3 rounded-md mt-2">
          <p className="text-sm">{aiResponse.advice || JSON.stringify(aiResponse)}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <BrainCircuit className="h-5 w-5 text-primary mr-2" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          {renderAIResponse()}
        </form>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4">
        <Button type="submit" onClick={handleSubmit} disabled={aiMutation.isPending || naturalLanguageUpdateMutation.isPending}>
          {(aiMutation.isPending || naturalLanguageUpdateMutation.isPending) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Get AI Assistance
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};