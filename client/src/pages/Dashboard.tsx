import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Mic, Briefcase, CheckSquare, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { EmailWidget } from "@/components/dashboard/EmailWidget";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ReportsWidget } from "@/components/dashboard/ReportsWidget";
import { DragDropProvider, useDashboard } from "@/components/dashboard/DragDropProvider";
import { DraggableWidget } from "@/components/dashboard/DraggableWidget";
import { CustomizationPanel } from "@/components/dashboard/CustomizationPanel";
import type { Lead, Project, Client, Task } from "@shared/schema";

export default function Dashboard() {
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    staleTime: 15 * 60 * 1000, // Fresh for 15 minutes
    refetchOnWindowFocus: false,
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false, // Don't retry failed requests
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  });

  const { data: stats } = useQuery<{
    totalLeads: number;
    activeProjects: number;
    totalClients: number;
    overdueTasks: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Filter tasks by context
  const notromTasks = tasks?.filter(task => task.context === 'notrom') || [];
  const podcastTasks = tasks?.filter(task => task.context === 'podcast') || [];
  const dayJobTasks = tasks?.filter(task => task.context === 'day_job') || [];
  const generalTasks = tasks?.filter(task => task.context === 'general') || [];

  const overdueTasks = tasks?.filter(task => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== "completed";
  }) || [];

  const todayTasks = tasks?.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  }) || [];

  // Dashboard widget configuration
  const dashboardWidgets = [
    {
      id: 'life-work-sections',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          <Link href="/notrom">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notrom</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notromTasks.length}</div>
                <p className="text-xs text-muted-foreground">Web development tasks</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/podcast">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Podcast</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{podcastTasks.length}</div>
                <p className="text-xs text-muted-foreground">Behind The Screens tasks</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/day-job">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Day Job</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dayJobTasks.length}</div>
                <p className="text-xs text-muted-foreground">Socially Powerful tasks</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tasks">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">General Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{generalTasks.length}</div>
                <p className="text-xs text-muted-foreground">Personal & misc tasks</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      ),
      title: 'Life & Work Sections',
      size: 'large' as const,
      enabled: true,
    },
    {
      id: 'stats-overview',
      component: (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
              <p className="text-xs text-muted-foreground">Opportunities</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.overdueTasks || 0}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>
      ),
      title: 'Quick Stats',
      size: 'large' as const,
      enabled: true,
    },
    {
      id: 'email-widget',
      component: <EmailWidget />,
      title: 'Email Management',
      size: 'medium' as const,
      enabled: true,
    },
    {
      id: 'revenue-chart',
      component: <RevenueChart />,
      title: 'Revenue Analytics',
      size: 'medium' as const,
      enabled: true,
    },
    {
      id: 'reports-widget',
      component: <ReportsWidget />,
      title: 'Reports & Insights',
      size: 'large' as const,
      enabled: true,
    },
    {
      id: 'todays-tasks',
      component: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Context: {task.context}
                      </p>
                    </div>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                      {task.priority}
                    </Badge>
                  </div>
                </Link>
              ))}
              {todayTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks due today</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      title: "Today's Tasks",
      size: 'medium' as const,
      enabled: true,
    },
    {
      id: 'overdue-tasks',
      component: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueTasks.slice(0, 5).map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {task.priority}
                    </Badge>
                  </div>
                </Link>
              ))}
              {overdueTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No overdue tasks</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      title: 'Overdue Tasks',
      size: 'medium' as const,
      enabled: true,
    },
    {
      id: 'task-distribution',
      component: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Notrom</span>
                <Badge variant="outline">{notromTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Podcast</span>
                <Badge variant="outline">{podcastTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Day Job</span>
                <Badge variant="outline">{dayJobTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">General</span>
                <Badge variant="outline">{generalTasks.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
      title: 'Task Distribution',
      size: 'small' as const,
      enabled: true,
    },
    {
      id: 'ai-assistant',
      component: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Get insights and suggestions for your unified workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <AIAssistant
              contextType="dashboard"
              placeholder="Ask about your tasks, get suggestions, or request insights across all contexts..."
              title="CurtisOS Assistant"
              description="I can help you manage your life and work tasks more effectively."
            />
          </CardContent>
        </Card>
      ),
      title: 'AI Assistant',
      size: 'large' as const,
      enabled: true,
    },
  ];

  return (
    <DragDropProvider initialItems={dashboardWidgets}>
      <DashboardContent dashboardWidgets={dashboardWidgets} />
    </DragDropProvider>
  );
}

function DashboardContent({ dashboardWidgets }: { dashboardWidgets: any[] }) {
  const { items, isCustomizing } = useDashboard();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">CurtisOS Dashboard</h1>
          <p className="text-muted-foreground">Unified life and work management system</p>
        </div>
      </div>

      {/* Customizable Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {items
          .filter(widget => widget.enabled || isCustomizing)
          .map(widget => (
            <DraggableWidget
              key={widget.id}
              id={widget.id}
              title={widget.title}
              size={widget.size}
              enabled={widget.enabled}
            >
              {widget.component}
            </DraggableWidget>
          ))}
      </div>

      {/* Customization Panel */}
      <CustomizationPanel />
    </div>
  );
}