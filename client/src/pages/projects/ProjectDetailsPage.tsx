import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ProjectForm } from "@/components/modules/projects/ProjectForm";
import { TaskForm } from "@/components/modules/tasks/TaskForm";
import { TaskTable } from "@/components/modules/tasks/TaskTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { Project, Task, Lead, Client } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = id === 'new';
  
  // Parse query parameters for new projects
  const queryParams = new URLSearchParams(window.location.search);
  const leadId = queryParams.get("leadId") ? parseInt(queryParams.get("leadId")!) : undefined;
  const clientId = queryParams.get("clientId") ? parseInt(queryParams.get("clientId")!) : undefined;
  
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !isNew && !!id,
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { projectId: id }],
    enabled: !isNew && !!id,
  });
  
  const { data: lead } = useQuery<Lead>({
    queryKey: [`/api/leads/${project?.leadId}`],
    enabled: !isNew && !!project?.leadId,
  });
  
  const { data: client } = useQuery<Client>({
    queryKey: [`/api/clients/${project?.clientId}`],
    enabled: !isNew && !!project?.clientId,
  });

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/projects">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? "Create New Project" : projectLoading ? "Loading..." : `Project: ${project?.name}`}
          </h1>
        </div>
      </div>

      {isNew ? (
        <ProjectForm leadId={leadId} />
      ) : (
        <>
          {project && (
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Project Name</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{project.name}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            <Badge variant="outline" className={cn("status-badge-" + project.status)}>
                              {project.status.replace(/_/g, " ")}
                            </Badge>
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Budget</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {project.budget ? `$${project.budget.toLocaleString()}` : <span className="text-gray-400">Not specified</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Start Date</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {project.startDate ? format(new Date(project.startDate), "PPP") : <span className="text-gray-400">Not set</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Deadline</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {project.deadline ? format(new Date(project.deadline), "PPP") : <span className="text-gray-400">Not set</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Contract</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            {project.contractSigned ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">Signed</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                          </dd>
                        </div>
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
                          <dt className="text-sm font-medium leading-6 text-gray-900">Lead</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {lead ? (
                              <Link href={`/leads/${lead.id}`} className="text-primary-600 hover:underline">
                                {lead.companyName}
                              </Link>
                            ) : (
                              <span className="text-gray-400">No lead associated</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Client</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client ? (
                              <Link href={`/clients/${client.id}`} className="text-primary-600 hover:underline">
                                {client.companyName}
                              </Link>
                            ) : (
                              <span className="text-gray-400">No client associated</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Tasks</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {!tasksLoading && tasks ? (
                              <>
                                <span className="font-medium">{tasks.length}</span> total tasks
                                <div className="mt-1">
                                  <span className="text-green-600">{tasks.filter(t => t.status === 'completed').length}</span> completed, 
                                  <span className="ml-1 text-blue-600">{tasks.filter(t => t.status !== 'completed').length}</span> remaining
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">Loading tasks...</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Created</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {format(new Date(project.createdAt), "PPP")}
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
                      {project.description ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.description}</p>
                      ) : (
                        <p className="text-sm text-gray-400">No description has been added yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <Button asChild>
                    <Link href={`/tasks/new?projectId=${project.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Link>
                  </Button>
                  {project.leadId && !project.clientId && (
                    <Button asChild variant="outline">
                      <Link href={`/clients/new?leadId=${project.leadId}`}>
                        Convert Lead to Client
                      </Link>
                    </Button>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Project Tasks</h2>
                      <Button asChild>
                        <Link href={`/tasks/new?projectId=${project.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Task
                        </Link>
                      </Button>
                    </div>
                    {tasks && tasks.length > 0 ? (
                      <TaskTable projectId={id} />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">This project doesn't have any tasks yet.</p>
                        <Button asChild>
                          <Link href={`/tasks/new?projectId=${project.id}`}>
                            Create First Task
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <ProjectForm project={project} isEdit={true} />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
