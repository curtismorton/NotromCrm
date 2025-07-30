import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Life & Work Contexts</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage tasks across different areas of your life. Click any section to view details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/notrom">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <Code className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Notrom Business</h4>
                    <p className="text-xs text-muted-foreground">Web development & client work</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{notromTasks.length}</div>
                  <p className="text-xs text-muted-foreground">tasks</p>
                </div>
              </div>
            </Link>
            
            <Link href="/podcast">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-md">
                    <Mic className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Behind The Screens</h4>
                    <p className="text-xs text-muted-foreground">Podcast production & content</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{podcastTasks.length}</div>
                  <p className="text-xs text-muted-foreground">tasks</p>
                </div>
              </div>
            </Link>
            
            <Link href="/day-job">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-md">
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Socially Powerful</h4>
                    <p className="text-xs text-muted-foreground">Full-time employment tasks</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{dayJobTasks.length}</div>
                  <p className="text-xs text-muted-foreground">tasks</p>
                </div>
              </div>
            </Link>
            
            <Link href="/tasks">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-md">
                    <CheckSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">General Tasks</h4>
                    <p className="text-xs text-muted-foreground">Personal & miscellaneous</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{generalTasks.length}</div>
                  <p className="text-xs text-muted-foreground">tasks</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ),
      title: 'Life & Work Contexts',
      size: 'large' as const,
      enabled: true,
    },
    {
      id: 'stats-overview',
      component: (
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Business Overview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Key metrics for your business performance. Click any stat to view details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/projects">
                <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-muted-foreground">PROJECTS</span>
                  </div>
                  <div className="text-xl font-bold">{stats?.activeProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">Active & in progress</p>
                </div>
              </Link>
              
              <Link href="/leads">
                <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-muted-foreground">LEADS</span>
                  </div>
                  <div className="text-xl font-bold">{stats?.totalLeads || 0}</div>
                  <p className="text-xs text-muted-foreground">Potential opportunities</p>
                </div>
              </Link>
              
              <Link href="/clients">
                <div className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-muted-foreground">CLIENTS</span>
                  </div>
                  <div className="text-xl font-bold">{stats?.totalClients || 0}</div>
                  <p className="text-xs text-muted-foreground">Active relationships</p>
                </div>
              </Link>
              
              <Link href="/tasks">
                <div className={`p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'border-red-200 bg-red-50' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`h-4 w-4 ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'text-red-600' : 'text-orange-600'}`} />
                    <span className="text-xs font-medium text-muted-foreground">OVERDUE</span>
                  </div>
                  <div className={`text-xl font-bold ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'text-red-600' : ''}`}>
                    {stats?.overdueTasks || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Tasks need attention</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      ),
      title: 'Business Overview',
      size: 'medium' as const,
      enabled: true,
    },
    {
      id: 'email-widget', 
      component: (
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              📧 Email Management
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Monitor important emails and response times. Connect Gmail to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailWidget />
          </CardContent>
        </Card>
      ),
      title: 'Email Management',
      size: 'medium' as const,
      enabled: true,
    },
    {
      id: 'revenue-chart',
      component: (
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              💰 Revenue Analytics
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Track your income, expenses, and profitability over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      ),
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4" />
              Today's Focus
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Tasks due today across all your contexts. Stay on track with your daily priorities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {task.context}
                        </Badge>
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {todayTasks.length === 0 && (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks due today</p>
                  <p className="text-xs text-muted-foreground">Enjoy your free time!</p>
                </div>
              )}
              {todayTasks.length > 4 && (
                <Link href="/tasks">
                  <div className="text-center py-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View {todayTasks.length - 4} more tasks
                    </Button>
                  </div>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ),
      title: "Today's Focus",
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header with better mobile spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">CurtisOS Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Unified life and work management system - track leads, manage projects, and automate workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CustomizationPanel />
        </div>
      </div>

      {/* Quick Actions for Mobile */}
      <div className="block sm:hidden mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link href="/leads">
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              Add Lead
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              New Project
            </Button>
          </Link>
          <Link href="/tasks">
            <Button size="sm" variant="outline" className="whitespace-nowrap">
              Create Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
    </div>
  );
}