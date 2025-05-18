import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { TaskForm } from "@/components/modules/tasks/TaskForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { Task, Project } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isNew = id === 'new';
  
  // Parse query parameters for new tasks
  const queryParams = new URLSearchParams(window.location.search);
  const projectId = queryParams.get("projectId") ? parseInt(queryParams.get("projectId")!) : undefined;
  
  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: [`/api/tasks/${id}`],
    enabled: !isNew && !!id,
  });
  
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${task?.projectId || projectId}`],
    enabled: (!isNew && !!task?.projectId) || (isNew && !!projectId),
  });
  
  const completeTaskMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/tasks/${id}`, { 
      status: "completed",
      completedAt: new Date().toISOString()
    }),
    onSuccess: async () => {
      toast({
        title: "Task completed",
        description: "The task has been marked as completed",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });
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
  
  const handleComplete = () => {
    completeTaskMutation.mutate();
  };

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/tasks">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Tasks
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? "Create New Task" : taskLoading ? "Loading..." : `Task: ${task?.title}`}
          </h1>
        </div>
      </div>

      {isNew ? (
        <TaskForm projectId={projectId} />
      ) : (
        <>
          {task && (
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-start">
                      <CardTitle>Task Information</CardTitle>
                      {task.status !== "completed" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-600"
                          onClick={handleComplete}
                          disabled={completeTaskMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Task Title</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{task.title}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            <Badge variant="outline" className={cn("task-status-" + task.status)}>
                              {task.status.replace(/_/g, " ")}
                            </Badge>
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Priority</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            <Badge variant="outline" className={cn("priority-badge-" + task.priority)}>
                              {task.priority}
                            </Badge>
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Due Date</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {task.dueDate ? format(new Date(task.dueDate), "PPP") : <span className="text-gray-400">Not set</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Assigned To</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {task.assignedTo ? task.assignedTo : <span className="text-gray-400">Unassigned</span>}
                          </dd>
                        </div>
                        {task.status === "completed" && task.completedAt && (
                          <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-gray-900">Completed On</dt>
                            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                              {format(new Date(task.completedAt), "PPP")}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Project</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {project ? (
                              <Link href={`/projects/${project.id}`} className="text-primary-600 hover:underline">
                                {project.name}
                              </Link>
                            ) : (
                              <span className="text-gray-400">No project associated</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Created</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {format(new Date(task.createdAt), "PPP")}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Last Updated</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {format(new Date(task.updatedAt), "PPP")}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {task.description ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
                      ) : (
                        <p className="text-sm text-gray-400">No description has been added yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <TaskForm task={task} isEdit={true} />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
