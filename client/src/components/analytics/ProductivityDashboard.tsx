import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Progress component is not available, we'll use a custom one
// import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Task, Lead, Project, Client } from "@shared/schema";
import { 
  TrendingUp, 
  Clock, 
  CheckSquare, 
  Target, 
  Calendar,
  BarChart3,
  Activity,
  AlertTriangle,
  Trophy,
  Zap
} from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks, startOfMonth, endOfMonth } from "date-fns";

interface ProductivityMetrics {
  tasksCompleted: number;
  tasksCompletedThisWeek: number;
  tasksCompletedLastWeek: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityTrend: 'up' | 'down' | 'stable';
  contextBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  overdueTasks: number;
  upcomingDeadlines: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
}

export const ProductivityDashboard = () => {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    staleTime: 10 * 60 * 1000,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 10 * 60 * 1000,
  });

  const metrics = useMemo((): ProductivityMetrics => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const lastWeekStart = startOfWeek(subWeeks(now, 1));
    const lastWeekEnd = endOfWeek(subWeeks(now, 1));
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const completedTasks = tasks.filter(task => task.status === 'completed');
    const thisWeekCompleted = completedTasks.filter(task => 
      task.completedAt && isWithinInterval(new Date(task.completedAt), { start: weekStart, end: weekEnd })
    );
    const lastWeekCompleted = completedTasks.filter(task =>
      task.completedAt && isWithinInterval(new Date(task.completedAt), { start: lastWeekStart, end: lastWeekEnd })
    );

    // Calculate completion rate
    const totalTasks = tasks.filter(task => task.status !== 'archived').length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Calculate productivity trend
    let productivityTrend: 'up' | 'down' | 'stable' = 'stable';
    if (thisWeekCompleted.length > lastWeekCompleted.length) {
      productivityTrend = 'up';
    } else if (thisWeekCompleted.length < lastWeekCompleted.length) {
      productivityTrend = 'down';
    }

    // Context breakdown
    const contextBreakdown = tasks.reduce((acc, task) => {
      acc[task.context || 'general'] = (acc[task.context || 'general'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority breakdown
    const priorityBreakdown = tasks.reduce((acc, task) => {
      if (task.status !== 'completed' && task.status !== 'archived') {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'completed' && 
      task.status !== 'archived'
    ).length;

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) >= now &&
      new Date(task.dueDate) <= nextWeek &&
      task.status !== 'completed' &&
      task.status !== 'archived'
    ).length;

    // Weekly goal progress (arbitrary target of 15 tasks per week)
    const weeklyGoalProgress = Math.min((thisWeekCompleted.length / 15) * 100, 100);

    // Monthly goal progress (arbitrary target of 60 tasks per month)
    const monthlyCompleted = completedTasks.filter(task =>
      task.completedAt && isWithinInterval(new Date(task.completedAt), { start: monthStart, end: monthEnd })
    );
    const monthlyGoalProgress = Math.min((monthlyCompleted.length / 60) * 100, 100);

    return {
      tasksCompleted: completedTasks.length,
      tasksCompletedThisWeek: thisWeekCompleted.length,
      tasksCompletedLastWeek: lastWeekCompleted.length,
      completionRate,
      averageCompletionTime: 0, // Would need task creation to completion time tracking
      productivityTrend,
      contextBreakdown,
      priorityBreakdown,
      overdueTasks,
      upcomingDeadlines,
      weeklyGoalProgress,
      monthlyGoalProgress,
    };
  }, [tasks]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getContextLabel = (context: string) => {
    switch (context) {
      case 'notrom': return 'Notrom Business';
      case 'podcast': return 'Podcast Production';
      case 'day_job': return 'Day Job';
      case 'general': return 'General Tasks';
      default: return context;
    }
  };

  const getContextColor = (context: string) => {
    switch (context) {
      case 'notrom': return 'bg-blue-500';
      case 'podcast': return 'bg-purple-500';
      case 'day_job': return 'bg-green-500';
      case 'general': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          Productivity Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your productivity metrics and identify patterns in your work
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed This Week</p>
                    <p className="text-2xl font-bold">{metrics.tasksCompletedThisWeek}</p>
                  </div>
                  <CheckSquare className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center mt-2">
                  {getTrendIcon(metrics.productivityTrend)}
                  <span className={`text-sm ml-1 ${getTrendColor(metrics.productivityTrend)}`}>
                    {metrics.tasksCompletedThisWeek - metrics.tasksCompletedLastWeek > 0 ? '+' : ''}
                    {metrics.tasksCompletedThisWeek - metrics.tasksCompletedLastWeek} from last week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${metrics.completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                    <p className="text-2xl font-bold">{metrics.overdueTasks}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                {metrics.overdueTasks > 0 && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    Needs attention
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
                    <p className="text-2xl font-bold">{metrics.upcomingDeadlines}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Next 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Context Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Work Context Distribution</CardTitle>
              <CardDescription>
                How your tasks are distributed across different contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(metrics.contextBreakdown).map(([context, count]) => (
                  <div key={context} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getContextColor(context)}`} />
                      <span className="font-medium">{getContextLabel(context)}</span>
                    </div>
                    <Badge variant="secondary">{count} tasks</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Breakdown</CardTitle>
                <CardDescription>Current status of all active tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['todo', 'in_progress', 'review', 'completed'].map((status) => {
                  const count = tasks.filter(task => task.status === status).length;
                  const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="capitalize text-sm font-medium">
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Active tasks by priority level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(metrics.priorityBreakdown).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        priority === 'high' ? 'bg-red-500' : 
                        priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      <span className="capitalize font-medium">{priority}</span>
                    </div>
                    <Badge variant={priority === 'high' ? 'destructive' : 'secondary'}>
                      {count} tasks
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Weekly Goal Progress
                </CardTitle>
                <CardDescription>Target: 15 tasks completed per week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.tasksCompletedThisWeek} / 15 tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ width: `${metrics.weeklyGoalProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {metrics.weeklyGoalProgress >= 100 ? (
                    <>
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Weekly goal achieved!
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-muted-foreground">
                        {15 - metrics.tasksCompletedThisWeek} tasks remaining
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Monthly Goal Progress
                </CardTitle>
                <CardDescription>Target: 60 tasks completed per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(metrics.monthlyGoalProgress * 0.6)} / 60 tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${metrics.monthlyGoalProgress}%` }}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {format(new Date(), 'MMMM yyyy')} progress: {metrics.monthlyGoalProgress.toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
                <CardDescription>AI-powered insights based on your work patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {/* Most Productive Context */}
                  {Object.keys(metrics.contextBreakdown).length > 0 && (
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold text-blue-900 mb-2">Most Active Context</h4>
                      <p className="text-sm text-blue-800">
                        You have the most tasks in{' '}
                        <strong>
                          {getContextLabel(
                            Object.entries(metrics.contextBreakdown)
                              .sort(([,a], [,b]) => b - a)[0][0]
                          )}
                        </strong>{' '}
                        with {Object.entries(metrics.contextBreakdown).sort(([,a], [,b]) => b - a)[0][1]} tasks.
                      </p>
                    </div>
                  )}

                  {/* Overdue Warning */}
                  {metrics.overdueTasks > 0 && (
                    <div className="p-4 border rounded-lg bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2">Attention Needed</h4>
                      <p className="text-sm text-red-800">
                        You have {metrics.overdueTasks} overdue task{metrics.overdueTasks > 1 ? 's' : ''}. 
                        Consider reviewing your workload and priorities.
                      </p>
                    </div>
                  )}

                  {/* Productivity Trend */}
                  <div className={`p-4 border rounded-lg ${
                    metrics.productivityTrend === 'up' ? 'bg-green-50' : 
                    metrics.productivityTrend === 'down' ? 'bg-orange-50' : 'bg-blue-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      metrics.productivityTrend === 'up' ? 'text-green-900' : 
                      metrics.productivityTrend === 'down' ? 'text-orange-900' : 'text-blue-900'
                    }`}>
                      Productivity Trend
                    </h4>
                    <p className={`text-sm ${
                      metrics.productivityTrend === 'up' ? 'text-green-800' : 
                      metrics.productivityTrend === 'down' ? 'text-orange-800' : 'text-blue-800'
                    }`}>
                      {metrics.productivityTrend === 'up' && 
                        `Great job! You completed ${metrics.tasksCompletedThisWeek - metrics.tasksCompletedLastWeek} more tasks this week than last week.`}
                      {metrics.productivityTrend === 'down' && 
                        `Your task completion has decreased by ${metrics.tasksCompletedLastWeek - metrics.tasksCompletedThisWeek} tasks this week. Consider reviewing your workflow.`}
                      {metrics.productivityTrend === 'stable' && 
                        `Your productivity is stable. You completed the same number of tasks as last week.`}
                    </p>
                  </div>

                  {/* Upcoming Deadlines */}
                  {metrics.upcomingDeadlines > 0 && (
                    <div className="p-4 border rounded-lg bg-yellow-50">
                      <h4 className="font-semibold text-yellow-900 mb-2">Upcoming Deadlines</h4>
                      <p className="text-sm text-yellow-800">
                        You have {metrics.upcomingDeadlines} task{metrics.upcomingDeadlines > 1 ? 's' : ''} due in the next 7 days. 
                        Plan your time accordingly to meet these deadlines.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};