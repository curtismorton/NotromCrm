import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Sparkles, Loader2, Clock, AlertCircle, List, PanelTopOpen, CheckCircle2, XCircle } from "lucide-react";
import { Project, Task, Client, Lead } from "@shared/schema";

interface AIAssistantProps {
  context?: string;
  contextType: "task" | "project" | "client" | "lead" | "dashboard";
  contextId?: number;
  placeholder?: string;
  title?: string;
  description?: string;
  onSuggestionSelect?: (suggestion: any) => void;
  projectData?: Project;
  tasksData?: Task[];
  clientData?: Client;
  leadData?: Lead;
}

export const AIAssistant = ({
  context,
  contextType,
  contextId,
  placeholder = "Ask me anything about this...",
  title = "AI Assistant",
  description = "I can help you with tasks, projects, clients, and more. Just tell me what you need.",
  onSuggestionSelect,
  projectData,
  tasksData,
  clientData,
  leadData
}: AIAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ask");
  
  // Load dashboard data for global context
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: contextType === 'dashboard'
  });
  
  const { data: overdueTasks } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => apiRequest('GET', '/api/tasks?status=overdue'),
    enabled: contextType === 'dashboard'
  });
  
  const { data: upcomingTasks } = useQuery({
    queryKey: ['/api/tasks/due-soon'],
    enabled: contextType === 'dashboard'
  });
  
  const { data: recentActivities } = useQuery({
    queryKey: ['/api/dashboard/recent-activities'],
    enabled: contextType === 'dashboard'
  });

  // Prepare contextual information for AI
  const getContextInformation = () => {
    // Create a base context object
    const contextInfo: Record<string, any> = {
      overdueTasks: Array.isArray(overdueTasks) ? overdueTasks.length : 0,
      upcomingDeadlines: Array.isArray(upcomingTasks) ? upcomingTasks.length : 0,
      projectsInProgress: dashboardStats?.activeProjects || 0,
      clientsWithIncompleteData: 0,
    };
    
    // Add project-specific context if available
    if (projectData) {
      contextInfo.projectName = projectData.name;
      contextInfo.projectStatus = projectData.status;
      contextInfo.projectDeadline = projectData.deadline;
      contextInfo.hasProjectTasks = Array.isArray(tasksData) && tasksData.length > 0;
      contextInfo.pendingTasks = Array.isArray(tasksData) ? 
        tasksData.filter(t => t.status !== 'completed').length : 0;
      contextInfo.completedTasks = Array.isArray(tasksData) ? 
        tasksData.filter(t => t.status === 'completed').length : 0;
    }
    
    // Add client-specific context if available
    if (clientData) {
      const missingFields: string[] = [];
      if (!clientData.contactEmail) missingFields.push('email');
      if (!clientData.contactPhone) missingFields.push('phone');
      if (!clientData.industry) missingFields.push('industry');
      
      contextInfo.clientName = clientData.companyName;
      contextInfo.missingClientData = missingFields;
      contextInfo.upsellOpportunity = clientData.upsellOpportunity;
    }
    
    return contextInfo;
  };

  const aiMutation = useMutation({
    mutationFn: async (data: { prompt: string }) => {
      let endpoint = "/api/ai/task-advice";
      let payload: any = {
        contextInfo: getContextInformation(),
      };

      switch (contextType) {
        case "task":
          endpoint = "/api/ai/task-advice";
          payload = {
            ...payload,
            taskDescription: context,
            taskStatus: "in_progress",
            prompt: data.prompt
          };
          break;
        case "project":
          endpoint = "/api/ai/generate-task-suggestions";
          payload = {
            ...payload,
            projectName: projectData?.name || "Current Project",
            projectDescription: context || projectData?.description,
            prompt: data.prompt
          };
          break;
        case "client":
          endpoint = "/api/ai/client-insights";
          payload = {
            ...payload,
            clientData: context || clientData,
            prompt: data.prompt
          };
          break;
        case "lead":
          endpoint = "/api/ai/search-prospective-clients";
          payload = {
            ...payload,
            industry: leadData?.industry || "Technology",
            criteria: data.prompt
          };
          break;
        case "dashboard":
          endpoint = "/api/ai/dashboard-insights";
          payload = {
            ...payload,
            dashboardStats,
            overdueTasks,
            upcomingTasks,
            recentActivities,
            prompt: data.prompt
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

  // Function to render section suggestions
  const renderSectionSuggestions = () => {
    // Show different suggestions based on context
    if (contextType === 'dashboard') {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">Try asking about:</h3>
          <ul className="space-y-2">
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("What's my priority today?")}
            >
              <Clock className="text-blue-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>What's my priority today?</span>
            </li>
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("Show me all stuck projects")}
            >
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>Show me all stuck projects</span>
            </li>
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("What client data is missing?")}
            >
              <List className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>What client data is missing?</span>
            </li>
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("Summarize my upcoming deadlines")}
            >
              <PanelTopOpen className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>Summarize my upcoming deadlines</span>
            </li>
          </ul>
        </div>
      );
    }
    
    if (contextType === 'project') {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">Try asking about:</h3>
          <ul className="space-y-2">
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("What tasks should I prioritize for this project?")}
            >
              <Clock className="text-blue-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>What tasks should I prioritize?</span>
            </li>
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("Create a task breakdown for this project")}
            >
              <List className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>Create a task breakdown</span>
            </li>
          </ul>
        </div>
      );
    }
    
    if (contextType === 'client') {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">Try asking about:</h3>
          <ul className="space-y-2">
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("What missing information should I collect from this client?")}
            >
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>What information is missing?</span>
            </li>
            <li 
              className="bg-slate-50 p-3 rounded-md hover:bg-slate-100 transition-colors cursor-pointer flex items-center"
              onClick={() => setPrompt("Suggest upsell opportunities for this client")}
            >
              <Sparkles className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
              <span>Suggest upsell opportunities</span>
            </li>
          </ul>
        </div>
      );
    }
    
    return null;
  };

  const renderAIResponse = () => {
    if (!aiResponse) {
      // If no response yet, show contextual suggestions
      return renderSectionSuggestions();
    }

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
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.priority}
                      </span>
                      {task.estimatedDays && (
                        <span className="text-xs text-gray-500">~{task.estimatedDays} days</span>
                      )}
                    </div>
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
            <p className="text-sm whitespace-pre-line">{aiResponse.insights}</p>
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
                <div className="mt-2 flex items-center text-xs">
                  <span className="text-gray-500">Approach: </span>
                  <span className="ml-1">{prospect.approach}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    if (contextType === "dashboard" && aiResponse.priorities) {
      return (
        <div className="mt-4 space-y-3">
          <h3 className="font-medium text-sm">AI Recommendations:</h3>
          <ul className="space-y-2">
            {aiResponse.priorities?.map((item: any, index: number) => (
              <li key={index} className="bg-slate-50 p-3 rounded-md">
                <div className="flex items-start">
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  ) : item.status === 'overdue' ? (
                    <XCircle className="text-red-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  ) : (
                    <Clock className="text-amber-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // For task advice and other general responses
    return (
      <div className="mt-4">
        <h3 className="font-medium text-sm">AI Advice:</h3>
        <div className="bg-slate-50 p-3 rounded-md mt-2">
          <p className="text-sm whitespace-pre-line">{aiResponse.advice || JSON.stringify(aiResponse)}</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="ask">Ask AI</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ask" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder={placeholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              {renderAIResponse()}
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  onClick={handleSubmit} 
                  disabled={aiMutation.isPending || naturalLanguageUpdateMutation.isPending}
                >
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
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-4">
            {renderSectionSuggestions() || (
              <div className="p-4 bg-slate-50 rounded-md text-center">
                <p className="text-sm text-slate-500">No suggestions available for this context.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};