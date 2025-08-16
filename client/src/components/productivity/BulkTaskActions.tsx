import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { 
  CheckSquare, 
  Archive, 
  AlertTriangle, 
  Clock, 
  User,
  Trash2,
  Play,
  Pause
} from "lucide-react";

interface BulkTaskActionsProps {
  tasks: Task[];
  selectedTasks: number[];
  onSelectionChange: (taskIds: number[]) => void;
  onActionComplete?: () => void;
}

export const BulkTaskActions = ({ 
  tasks, 
  selectedTasks, 
  onSelectionChange, 
  onActionComplete 
}: BulkTaskActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkValue, setBulkValue] = useState<string>("");
  const { toast } = useToast();

  const selectedTaskObjects = tasks.filter(task => selectedTasks.includes(task.id));
  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;
  const someSelected = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { taskIds: number[]; updates: Partial<Task> }) => {
      return Promise.all(
        updates.taskIds.map(taskId =>
          apiRequest('PATCH', `/api/tasks/${taskId}`, updates.updates)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Bulk action completed",
        description: `Updated ${selectedTasks.length} tasks successfully`,
      });

      onSelectionChange([]);
      setIsOpen(false);
      setBulkAction("");
      setBulkValue("");
      
      if (onActionComplete) {
        onActionComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tasks.map(task => task.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedTasks.length === 0) return;

    let updates: Partial<Task> = {};

    switch (bulkAction) {
      case 'status':
        updates.status = bulkValue as Task['status'];
        break;
      case 'priority':
        updates.priority = bulkValue as Task['priority'];
        break;
      case 'context':
        updates.context = bulkValue as Task['context'];
        break;
      case 'archive':
        updates.status = 'archived';
        break;
      case 'complete':
        updates.status = 'completed';
        updates.completedAt = new Date().toISOString() as any;
        break;
      default:
        return;
    }

    bulkUpdateMutation.mutate({ taskIds: selectedTasks, updates });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'complete': return <CheckSquare className="w-4 h-4" />;
      case 'archive': return <Archive className="w-4 h-4" />;
      case 'priority': return <AlertTriangle className="w-4 h-4" />;
      case 'status': return <Play className="w-4 h-4" />;
      case 'context': return <User className="w-4 h-4" />;
      default: return null;
    }
  };

  const quickActions = [
    { id: 'complete', label: 'Mark Complete', icon: CheckSquare },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'priority-high', label: 'High Priority', icon: AlertTriangle },
    { id: 'status-progress', label: 'In Progress', icon: Play },
  ];

  const handleQuickAction = (actionId: string) => {
    let updates: Partial<Task> = {};

    switch (actionId) {
      case 'complete':
        updates = { status: 'completed', completedAt: new Date().toISOString() as any };
        break;
      case 'archive':
        updates = { status: 'archived' };
        break;
      case 'priority-high':
        updates = { priority: 'high' };
        break;
      case 'status-progress':
        updates = { status: 'in_progress' };
        break;
      default:
        return;
    }

    bulkUpdateMutation.mutate({ taskIds: selectedTasks, updates });
  };

  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg border">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            ref={(el) => {
              if (el) (el as any).indeterminate = someSelected;
            }}
          />
          <span className="text-sm font-medium">
            {selectedTasks.length === 0
              ? `Select tasks (${tasks.length} total)`
              : `${selectedTasks.length} of ${tasks.length} selected`
            }
          </span>
        </div>

        {selectedTasks.length > 0 && (
          <Badge variant="secondary">
            {selectedTasks.length} selected
          </Badge>
        )}
      </div>

      {/* Quick Actions */}
      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant="outline"
              onClick={() => handleQuickAction(action.id)}
              disabled={bulkUpdateMutation.isPending}
              className="text-xs"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs">
                More Actions...
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Actions</DialogTitle>
                <DialogDescription>
                  Apply changes to {selectedTasks.length} selected tasks
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Update Status</SelectItem>
                      <SelectItem value="priority">Update Priority</SelectItem>
                      <SelectItem value="context">Update Context</SelectItem>
                      <SelectItem value="complete">Mark as Complete</SelectItem>
                      <SelectItem value="archive">Archive Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {['status', 'priority', 'context'].includes(bulkAction) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Value</label>
                    <Select value={bulkValue} onValueChange={setBulkValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkAction === 'status' && (
                          <>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </>
                        )}
                        {bulkAction === 'priority' && (
                          <>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </>
                        )}
                        {bulkAction === 'context' && (
                          <>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="notrom">Notrom</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="day_job">Day Job</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Selected Tasks Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Tasks</label>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 border rounded">
                    {selectedTaskObjects.map((task) => (
                      <div key={task.id} className="text-xs p-1 bg-muted rounded">
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={bulkUpdateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || bulkUpdateMutation.isPending || 
                    (['status', 'priority', 'context'].includes(bulkAction) && !bulkValue)}
                >
                  {bulkUpdateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      {getActionIcon(bulkAction)}
                      Apply to {selectedTasks.length} Tasks
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};