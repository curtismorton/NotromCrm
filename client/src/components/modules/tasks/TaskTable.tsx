import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, CheckCircle } from "lucide-react";
import { Task, Project } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, addDays } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { api, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskTableProps {
  projectId?: string | number;
}

export const TaskTable = ({ projectId }: TaskTableProps = {}) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: projectId ? ["/api/tasks", { projectId }] : ["/api/tasks"],
  });
  
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/tasks/${id}`),
    onSuccess: async () => {
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks/due-soon"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => 
      api.patch(`/api/tasks/${taskId}`, { 
        status: "completed",
        completedAt: new Date().toISOString()
      }),
    onSuccess: async () => {
      toast({
        title: "Task completed",
        description: "The task has been marked as completed",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks/due-soon"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    setSelectedTaskId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTaskId) {
      deleteMutation.mutate(selectedTaskId);
    }
    setDeleteDialogOpen(false);
  };

  const handleComplete = (id: number) => {
    completeTaskMutation.mutate(id);
  };

  const getDueDateStatus = (dueDate: string | null | undefined) => {
    if (!dueDate) return { status: "none", label: "No due date" };
    
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { status: "overdue", label: `Overdue: ${format(date, "MMM d")}` };
    }
    if (isToday(date)) {
      return { status: "today", label: "Due today" };
    }
    if (isPast(addDays(new Date(), 3)) && !isPast(date)) {
      return { status: "soon", label: `Due ${format(date, "MMM d")}` };
    }
    
    return { status: "normal", label: format(date, "MMM d, yyyy") };
  };

  const columns = [
    {
      header: "",
      accessorKey: "id" as keyof Task,
      cell: (task: Task) => (
        <Checkbox
          checked={task.status === "completed"}
          onCheckedChange={() => {
            if (task.status !== "completed") {
              handleComplete(task.id);
            }
          }}
          disabled={task.status === "completed"}
        />
      ),
    },
    {
      header: "Task",
      accessorKey: "title",
      cell: (task: Task) => (
        <div>
          <div className={cn(
            "font-medium",
            task.status === "completed" && "text-muted-foreground line-through"
          )}>
            {task.title}
          </div>
          {task.projectId && !projectId && projects && (
            <div className="text-xs text-muted-foreground">
              Project: {projects.find(p => p.id === task.projectId)?.name || `#${task.projectId}`}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (task: Task) => (
        <Badge variant="outline" className={cn("task-status-" + task.status)}>
          {task.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (task: Task) => (
        <Badge variant="outline" className={cn("priority-badge-" + task.priority)}>
          {task.priority}
        </Badge>
      ),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (task: Task) => {
        const { status, label } = getDueDateStatus(task.dueDate?.toString());
        return (
          <div className={cn(
            "text-sm",
            status === "overdue" && "text-red-600 font-medium",
            status === "today" && "text-amber-600 font-medium",
            status === "soon" && "text-amber-500",
            task.status === "completed" && "text-muted-foreground line-through"
          )}>
            {label}
          </div>
        );
      },
    },
  ];

  const renderRowActions = (task: Task) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/tasks/${task.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </Link>
        </DropdownMenuItem>
        {task.status !== "completed" && (
          <DropdownMenuItem onClick={() => handleComplete(task.id)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Mark Complete</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(task.id);
          }}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={tasks || []}
        isLoading={isLoading}
        searchField="title"
        renderRowActions={renderRowActions}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
