import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Code, 
  Users, 
  FolderKanban, 
  Building2, 
  Plus, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Zap,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { Lead, Project, Client, Task, Revenue } from "@shared/schema";

export default function NotromPage() {
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: revenues } = useQuery<Revenue[]>({
    queryKey: ["/api/revenue"],
  });

  // Filter for Notrom-related items using better logic
  const notromLeads = leads?.filter(lead => 
    lead.notes?.toLowerCase().includes('notrom') || 
    lead.source?.toLowerCase().includes('notrom') ||
    lead.notes?.toLowerCase().includes('web development') ||
    lead.notes?.toLowerCase().includes('website')
  ) || [];

  const notromProjects = projects?.filter(project => 
    project.description?.toLowerCase().includes('notrom') ||
    project.name?.toLowerCase().includes('web') ||
    project.name?.toLowerCase().includes('website') ||
    project.name?.toLowerCase().includes('app') ||
    project.name?.toLowerCase().includes('development')
  ) || [];

  const notromClients = clients?.filter(client =>
    client.notes?.toLowerCase().includes('notrom') ||
    client.notes?.toLowerCase().includes('web development') ||
    // Include clients who have web development projects
    notromProjects.some(project => project.clientId === client.id)
  ) || [];

  const notromTasks = tasks?.filter(task =>
    task.context === 'notrom' ||
    task.title?.toLowerCase().includes('notrom') ||
    task.title?.toLowerCase().includes('web') ||
    task.title?.toLowerCase().includes('development') ||
    task.description?.toLowerCase().includes('notrom')
  ) || [];

  const notromRevenues = revenues?.filter(revenue =>
    revenue.context === 'notrom' ||
    revenue.type === 'notrom_project'
  ) || [];

  // Calculate business metrics
  const activeProjects = notromProjects.filter(p => p.status === 'in_progress' || p.status === 'onboarding');
  const completedProjects = notromProjects.filter(p => p.status === 'completed');
  const newLeads = notromLeads.filter(l => l.status === 'new');
  const qualifiedLeads = notromLeads.filter(l => l.status === 'qualified' || l.status === 'proposal');
  
  const todoTasks = notromTasks.filter(t => t.status === 'todo');
  const inProgressTasks = notromTasks.filter(t => t.status === 'in_progress');
  const completedTasks = notromTasks.filter(t => t.status === 'completed');
  const overdueTasks = notromTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );

  // Revenue calculations (convert from cents)
  const totalRevenue = notromRevenues.reduce((sum, r) => sum + (r.amount || 0), 0) / 100;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = notromRevenues
    .filter(r => {
      const date = new Date(r.receivedAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + (r.amount || 0), 0) / 100;

  const projectCompletionRate = notromProjects.length > 0 
    ? Math.round((completedProjects.length / notromProjects.length) * 100) 
    : 0;

  const taskCompletionRate = notromTasks.length > 0
    ? Math.round((completedTasks.length / notromTasks.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="w-8 h-8 text-blue-600" />
            Notrom Business
          </h1>
          <p className="text-muted-foreground">Professional web development services</p>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks/new?context=notrom">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="sm" variant="outline">
              <FolderKanban className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
          <Link href="/leads">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month: ${monthlyRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{notromLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              {qualifiedLeads.length} qualified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{notromTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks.length > 0 && (
                <span className="text-red-500">{overdueTasks.length} overdue</span>
              )}
              {overdueTasks.length === 0 && (
                <span className="text-green-600">All on track</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{projectCompletionRate}%</span>
              </div>
              <Progress value={projectCompletionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedProjects.length} of {notromProjects.length} projects completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{taskCompletionRate}%</span>
              </div>
              <Progress value={taskCompletionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedTasks.length} of {notromTasks.length} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...overdueTasks, ...todoTasks.filter(t => t.priority === 'high')].slice(0, 5).map((task) => (
                    <Link key={task.id} href={`/tasks/${task.id}`}>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.dueDate && `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {overdueTasks.includes(task) && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {overdueTasks.length === 0 && todoTasks.filter(t => t.priority === 'high').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No urgent tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...activeProjects, ...newLeads.slice(0, 3)].slice(0, 5).map((item, index) => (
                    <div key={`activity-${index}`} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      {'status' in item ? (
                        <FolderKanban className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Users className="h-4 w-4 text-purple-600" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {'status' in item ? item.name : item.companyName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {'status' in item 
                            ? `Project ${item.status}` 
                            : `New lead from ${item.contactName}`
                          }
                        </p>
                      </div>
                      <Badge variant="outline">
                        {'status' in item ? item.status : item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">To Do</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todoTasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressTasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Notrom Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notromTasks.slice(0, 10).map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium",
                          task.status === 'completed' && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.dueDate && `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                          {task.description && ` • ${task.description.slice(0, 50)}...`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{task.status}</Badge>
                        <Badge variant={
                          task.priority === 'high' ? 'destructive' : 
                          task.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
                {notromTasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No tasks yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.deadline && `Due: ${new Date(project.deadline).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {activeProjects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No active projects</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedProjects.slice(0, 5).map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.completedDate && `Completed: ${new Date(project.completedDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {project.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {completedProjects.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No completed projects yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>New Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {newLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                        <div>
                          <p className="font-medium">{lead.companyName}</p>
                          <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                        </div>
                        <Badge variant="default">
                          {lead.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {newLeads.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No new leads</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualified Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {qualifiedLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer">
                        <div>
                          <p className="font-medium">{lead.companyName}</p>
                          <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                        </div>
                        <Badge variant="secondary">
                          {lead.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {qualifiedLeads.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No qualified leads</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Current month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Average Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${completedProjects.length > 0 ? Math.round(totalRevenue / completedProjects.length).toLocaleString() : '0'}
                </div>
                <p className="text-xs text-muted-foreground">Per project</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notromRevenues.slice(0, 10).map((revenue) => (
                  <div key={revenue.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">${(revenue.amount / 100).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {revenue.description} • {new Date(revenue.receivedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {revenue.type}
                    </Badge>
                  </div>
                ))}
                {notromRevenues.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No revenue records yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}