import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export const UpcomingTasks = () => {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/due-soon"],
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => 
      apiRequest("PATCH", `/api/tasks/${taskId}`, { status: "completed" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/due-soon"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const getPriorityBadgeClass = (priority: string) => {
    return `priority-badge-${priority}`;
  };

  const formatDueDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Due today";
    if (date.toDateString() === tomorrow.toDateString()) return "Due tomorrow";
    
    return `Due ${format(date, "MMM d")}`;
  };

  const handleTaskComplete = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between border-b px-6 py-4">
        <CardTitle className="text-lg font-medium">Upcoming Tasks</CardTitle>
        <Link href="/tasks">
          <Button variant="link" className="text-primary-600 hover:text-primary-500">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <li key={i} className="py-4">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-4 w-4 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                  </div>
                </li>
              ))
          ) : tasks && tasks.length > 0 ? (
            tasks.slice(0, 5).map((task) => (
              <li key={task.id} className="py-4">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.status === "completed"}
                    onCheckedChange={() => handleTaskComplete(task.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "font-medium text-gray-900",
                        task.status === "completed" && "line-through text-gray-400"
                      )}>
                        {task.title}
                      </p>
                      <Badge variant="outline" className={cn("text-xs", getPriorityBadgeClass(task.priority))}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">
                        {formatDueDate(task.dueDate?.toString())}
                        {task.projectId && " - for Project"}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">
              No upcoming tasks
            </li>
          )}
        </ul>
        <div className="mt-6">
          <Link href="/tasks/new">
            <Button className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Task
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
