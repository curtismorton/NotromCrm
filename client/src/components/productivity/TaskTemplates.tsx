import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { 
  FileText, 
  Plus, 
  Code, 
  Briefcase, 
  Mic, 
  Home,
  Zap,
  Clock,
  Target
} from "lucide-react";

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  context: 'general' | 'notrom' | 'podcast' | 'day_job';
  priority: 'low' | 'medium' | 'high';
  tasks: {
    title: string;
    description: string;
    estimatedHours?: number;
    dependencies?: number[];
  }[];
  tags: string[];
}

const predefinedTemplates: TaskTemplate[] = [
  {
    id: 'client-project-kickoff',
    name: 'Client Project Kickoff',
    description: 'Complete checklist for starting a new client project',
    context: 'notrom',
    priority: 'high',
    tasks: [
      {
        title: 'Initial client discovery call',
        description: 'Understand requirements, goals, and project scope',
        estimatedHours: 2
      },
      {
        title: 'Create project brief document',
        description: 'Document all requirements and project specifications',
        estimatedHours: 1
      },
      {
        title: 'Set up project repository',
        description: 'Initialize Git repo, project structure, and development environment',
        estimatedHours: 1
      },
      {
        title: 'Create project timeline',
        description: 'Break down deliverables and set milestones',
        estimatedHours: 1
      },
      {
        title: 'Send project proposal',
        description: 'Finalize and send detailed proposal to client',
        estimatedHours: 2
      }
    ],
    tags: ['client', 'kickoff', 'project']
  },
  {
    id: 'podcast-episode-production',
    name: 'Podcast Episode Production',
    description: 'End-to-end workflow for producing a podcast episode',
    context: 'podcast',
    priority: 'medium',
    tasks: [
      {
        title: 'Research episode topic',
        description: 'Gather information, statistics, and talking points',
        estimatedHours: 3
      },
      {
        title: 'Prepare show outline',
        description: 'Create detailed episode structure and questions',
        estimatedHours: 1
      },
      {
        title: 'Record episode',
        description: 'Set up equipment and record the episode',
        estimatedHours: 2
      },
      {
        title: 'Edit audio',
        description: 'Clean up audio, add intro/outro, and apply effects',
        estimatedHours: 4
      },
      {
        title: 'Create show notes',
        description: 'Write episode summary and key takeaways',
        estimatedHours: 1
      },
      {
        title: 'Upload and schedule',
        description: 'Upload to hosting platform and schedule release',
        estimatedHours: 0.5
      }
    ],
    tags: ['podcast', 'content', 'production']
  },
  {
    id: 'talent-assessment',
    name: 'Talent Assessment Process',
    description: 'Comprehensive talent evaluation workflow',
    context: 'day_job',
    priority: 'high',
    tasks: [
      {
        title: 'Review candidate application',
        description: 'Evaluate resume, portfolio, and initial application',
        estimatedHours: 0.5
      },
      {
        title: 'Conduct phone screening',
        description: 'Initial phone interview to assess basic fit',
        estimatedHours: 1
      },
      {
        title: 'Technical assessment',
        description: 'Evaluate technical skills relevant to role',
        estimatedHours: 2
      },
      {
        title: 'Team interview',
        description: 'Panel interview with team members',
        estimatedHours: 1.5
      },
      {
        title: 'Reference checks',
        description: 'Contact previous employers or references',
        estimatedHours: 1
      },
      {
        title: 'Final decision meeting',
        description: 'Team discussion and hiring decision',
        estimatedHours: 0.5
      }
    ],
    tags: ['hiring', 'assessment', 'talent']
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review Process',
    description: 'Personal productivity and goal review',
    context: 'general',
    priority: 'medium',
    tasks: [
      {
        title: 'Review completed tasks',
        description: 'Go through all tasks completed this week',
        estimatedHours: 0.5
      },
      {
        title: 'Assess goal progress',
        description: 'Check progress against weekly and monthly goals',
        estimatedHours: 0.5
      },
      {
        title: 'Plan next week priorities',
        description: 'Identify and prioritize key tasks for next week',
        estimatedHours: 1
      },
      {
        title: 'Clean up task list',
        description: 'Archive completed tasks and update ongoing ones',
        estimatedHours: 0.5
      },
      {
        title: 'Reflect and improve',
        description: 'Note lessons learned and process improvements',
        estimatedHours: 0.5
      }
    ],
    tags: ['review', 'planning', 'productivity']
  }
];

interface TaskTemplatesProps {
  onTemplateApply?: (tasks: Partial<Task>[]) => void;
}

export const TaskTemplates = ({ onTemplateApply }: TaskTemplatesProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [customContext, setCustomContext] = useState<'general' | 'notrom' | 'podcast' | 'day_job'>('general');
  const { toast } = useToast();

  const createTasksMutation = useMutation({
    mutationFn: async (tasks: Partial<Task>[]) => {
      return Promise.all(
        tasks.map(task => apiRequest('POST', '/api/tasks', task))
      );
    },
    onSuccess: (_, tasks) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Template applied successfully",
        description: `Created ${tasks.length} tasks from template`,
      });

      if (onTemplateApply) {
        onTemplateApply(tasks);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create tasks from template",
        variant: "destructive",
      });
    },
  });

  const applyTemplate = (template: TaskTemplate, context?: string) => {
    const tasks: Partial<Task>[] = template.tasks.map((task, index) => ({
      title: task.title,
      description: task.description,
      context: (context || template.context) as Task['context'],
      priority: template.priority,
      status: 'todo' as const,
    }));

    createTasksMutation.mutate(tasks);
    setSelectedTemplate(null);
  };

  const getContextIcon = (context: string) => {
    switch (context) {
      case 'notrom': return <Code className="w-4 h-4 text-blue-600" />;
      case 'podcast': return <Mic className="w-4 h-4 text-purple-600" />;
      case 'day_job': return <Briefcase className="w-4 h-4 text-green-600" />;
      case 'general': return <Home className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getContextColor = (context: string) => {
    switch (context) {
      case 'notrom': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'podcast': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'day_job': return 'bg-green-50 border-green-200 text-green-700';
      case 'general': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Templates</h2>
          <p className="text-muted-foreground">
            Quickly create task sets from pre-built templates
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {predefinedTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getContextIcon(template.context)}
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={getContextColor(template.context)}
                >
                  {template.context.replace('_', ' ')}
                </Badge>
                <Badge 
                  variant="outline"
                  className={getPriorityColor(template.priority)}
                >
                  {template.priority} priority
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {template.tasks.length} tasks
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.tasks.reduce((acc, task) => acc + (task.estimatedHours || 1), 0)}h est.
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Tasks included:</p>
                <ul className="text-sm space-y-1">
                  {template.tasks.slice(0, 3).map((task, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1 h-1 bg-current rounded-full" />
                      {task.title}
                    </li>
                  ))}
                  {template.tasks.length > 3 && (
                    <li className="text-xs text-muted-foreground italic">
                      +{template.tasks.length - 3} more tasks...
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  disabled={createTasksMutation.isPending}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Apply Template
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setSelectedTemplate(template)}>
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getContextIcon(template.context)}
                        {template.name}
                      </DialogTitle>
                      <DialogDescription>{template.description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Badge className={getContextColor(template.context)}>
                          {template.context.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(template.priority)}>
                          {template.priority} priority
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Template Tasks ({template.tasks.length})</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {template.tasks.map((task, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="font-medium text-sm">{task.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {task.description}
                              </div>
                              {task.estimatedHours && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.estimatedHours}h estimated
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Apply to Context:</label>
                        <Select value={customContext} onValueChange={(value) => setCustomContext(value as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="notrom">Notrom</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="day_job">Day Job</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => applyTemplate(template, customContext)}
                        disabled={createTasksMutation.isPending}
                      >
                        {createTasksMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Create {template.tasks.length} Tasks
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};