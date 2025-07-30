import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  User,
  Flag,
  Building2,
  Briefcase,
  Mic,
  Home,
  FileText,
  RotateCcw,
  ArrowRight,
  Edit3,
  Star,
  Archive
} from "lucide-react";
import { Link } from "wouter";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskCardListProps {
  context?: 'notrom' | 'podcast' | 'day_job' | 'general' | 'all';
  status?: string;
  priority?: string;
}

export function TaskCardList({ context = 'all', status, priority }: TaskCardListProps) {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { toast } = useToast();

  // Quick action mutations
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: Partial<Task> }) => {
      return apiRequest(`/api/tasks/${taskId}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Task has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const quickStatusUpdate = (taskId: number, newStatus: 'todo' | 'in_progress' | 'review' | 'completed') => {
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
  };

  const quickPriorityUpdate = (taskId: number, newPriority: 'low' | 'medium' | 'high') => {
    updateTaskMutation.mutate({ taskId, updates: { priority: newPriority } });
  };

  const filteredTasks = tasks.filter(task => {
    const contextMatch = context === 'all' || task.context === context;
    const statusMatch = !status || task.status === status;
    const priorityMatch = !priority || task.priority === priority;
    
    return contextMatch && statusMatch && priorityMatch;
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      color: string; 
      icon: JSX.Element; 
      label: string;
      bgColor: string;
    }> = {
      'todo': {
        color: 'bg-gray-100 text-gray-800',
        icon: <FileText className="w-4 h-4" />,
        label: 'To Do',
        bgColor: 'bg-gray-50 border-l-gray-500'
      },
      'in_progress': {
        color: 'bg-blue-100 text-blue-800',
        icon: <Play className="w-4 h-4" />,
        label: 'In Progress',
        bgColor: 'bg-blue-50 border-l-blue-500'
      },
      'review': {
        color: 'bg-purple-100 text-purple-800',
        icon: <Pause className="w-4 h-4" />,
        label: 'Review',
        bgColor: 'bg-purple-50 border-l-purple-500'
      },
      'completed': {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Completed',
        bgColor: 'bg-green-50 border-l-green-500'
      }
    };
    return configs[status] || configs['todo'];
  };

  const getPriorityConfig = (priority: string) => {
    const configs: Record<string, { 
      color: string; 
      icon: string;
      textColor: string;
    }> = {
      'high': {
        color: 'bg-red-100 text-red-800',
        icon: '🔥',
        textColor: 'text-red-600'
      },
      'medium': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⚡',
        textColor: 'text-yellow-600'
      },
      'low': {
        color: 'bg-green-100 text-green-800',
        icon: '📝',
        textColor: 'text-green-600'
      }
    };
    return configs[priority] || configs['medium'];
  };

  const getContextConfig = (context: string) => {
    const configs: Record<string, { 
      icon: JSX.Element; 
      label: string;
      color: string;
      bgColor: string;
    }> = {
      'notrom': {
        icon: <Building2 className="w-4 h-4" />,
        label: 'Notrom Business',
        color: 'text-blue-600',
        bgColor: 'border-l-blue-500'
      },
      'podcast': {
        icon: <Mic className="w-4 h-4" />,
        label: 'Behind The Screens',
        color: 'text-purple-600',
        bgColor: 'border-l-purple-500'
      },
      'day_job': {
        icon: <Briefcase className="w-4 h-4" />,
        label: 'Day Job',
        color: 'text-green-600',
        bgColor: 'border-l-green-500'
      },
      'general': {
        icon: <Home className="w-4 h-4" />,
        label: 'General',
        color: 'text-gray-600',
        bgColor: 'border-l-gray-500'
      }
    };
    return configs[context] || configs['general'];
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const isDueToday = (task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  };

  const isDueSoon = (task: Task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading tasks...</div>;
  }

  if (filteredTasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {context === 'all' 
              ? "You haven't created any tasks yet." 
              : `No tasks found for ${context}.`}
          </p>
          <Button asChild>
            <Link href="/tasks/new">Create Your First Task</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => {
          const statusConfig = getStatusConfig(task.status);
          const priorityConfig = getPriorityConfig(task.priority);
          const contextConfig = getContextConfig(task.context);
          const taskIsOverdue = isOverdue(task);
          const taskIsDueToday = isDueToday(task);
          const taskIsDueSoon = isDueSoon(task);
          
          return (
            <Card key={task.id} className={cn(
              "h-full transition-all hover:shadow-md border-l-4",
              statusConfig.bgColor,
              contextConfig.bgColor,
              taskIsOverdue && "ring-2 ring-red-200"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold mb-2 line-clamp-2">
                      <Link href={`/tasks/${task.id}`} className="hover:text-primary">
                        {task.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={statusConfig.color} variant="secondary">
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.label}</span>
                      </Badge>
                      <Badge className={priorityConfig.color} variant="secondary">
                        <span>{priorityConfig.icon}</span>
                        <span className="ml-1">{task.priority}</span>
                      </Badge>
                    </div>
                  </div>
                  {taskIsOverdue && (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Task Description */}
                {task.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {task.description}
                  </p>
                )}

                {/* Timeline Information */}
                <div className="space-y-2">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className={cn(
                        taskIsOverdue && 'text-red-600 font-medium',
                        taskIsDueToday && 'text-orange-600 font-medium',
                        taskIsDueSoon && 'text-yellow-600 font-medium'
                      )}>
                        {new Date(task.dueDate).toLocaleDateString()}
                        {taskIsOverdue && ' (Overdue)'}
                        {taskIsDueToday && ' (Today)'}
                        {taskIsDueSoon && ' (Due Soon)'}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Context and Assignment */}
                <div className="space-y-2 pt-2 border-t">
                  <div className={cn("flex items-center gap-2 text-sm", contextConfig.color)}>
                    {contextConfig.icon}
                    <span>{contextConfig.label}</span>
                  </div>
                  
                  {task.assignedTo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>Assigned to: {task.assignedTo}</span>
                    </div>
                  )}
                </div>

                {/* Urgency Indicators */}
                {(taskIsOverdue || taskIsDueToday || taskIsDueSoon) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {taskIsOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        🚨 Overdue
                      </Badge>
                    )}
                    {taskIsDueToday && !taskIsOverdue && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        ⏰ Due Today
                      </Badge>
                    )}
                    {taskIsDueSoon && !taskIsDueToday && !taskIsOverdue && (
                      <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200">
                        📅 Due Soon
                      </Badge>
                    )}
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="space-y-2 pt-2 border-t">
                  {/* Status Quick Actions */}
                  <div className="flex gap-1 flex-wrap">
                    {task.status !== 'completed' && (
                      <>
                        {task.status === 'todo' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickStatusUpdate(task.id, 'in_progress')}
                            disabled={updateTaskMutation.isPending}
                            className="flex-1 min-w-0 text-xs"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => quickStatusUpdate(task.id, 'review')}
                              disabled={updateTaskMutation.isPending}
                              className="flex-1 min-w-0 text-xs"
                            >
                              <Pause className="w-3 h-3 mr-1" />
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => quickStatusUpdate(task.id, 'completed')}
                              disabled={updateTaskMutation.isPending}
                              className="flex-1 min-w-0 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                        {task.status === 'review' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => quickStatusUpdate(task.id, 'in_progress')}
                              disabled={updateTaskMutation.isPending}
                              className="flex-1 min-w-0 text-xs"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Resume
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => quickStatusUpdate(task.id, 'completed')}
                              disabled={updateTaskMutation.isPending}
                              className="flex-1 min-w-0 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                      </>
                    )}
                    {task.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickStatusUpdate(task.id, 'todo')}
                        disabled={updateTaskMutation.isPending}
                        className="flex-1 min-w-0 text-xs"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reopen
                      </Button>
                    )}
                  </div>

                  {/* Priority and Edit Actions */}
                  <div className="flex gap-1 flex-wrap">
                    {task.priority !== 'high' && task.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => quickPriorityUpdate(task.id, 'high')}
                        disabled={updateTaskMutation.isPending}
                        className="flex-1 min-w-0 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        High Priority
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="flex-1 min-w-0 text-xs"
                    >
                      <Link href={`/tasks/${task.id}`}>
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}