import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Target, TrendingUp, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Task, Lead } from "@shared/schema";

export default function DayJobPage() {
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  // Filter for day job related tasks and leads
  const dayJobTasks = tasks?.filter(task => 
    task.context === 'day_job' ||
    task.title?.toLowerCase().includes('socially powerful') ||
    task.title?.toLowerCase().includes('talent') ||
    task.title?.toLowerCase().includes('recruitment') ||
    task.description?.toLowerCase().includes('talent')
  ) || [];

  const talentLeads = leads?.filter(lead => 
    lead.notes?.toLowerCase().includes('talent') ||
    lead.notes?.toLowerCase().includes('socially powerful') ||
    lead.industry?.toLowerCase().includes('talent')
  ) || [];

  const highPriorityTasks = dayJobTasks.filter(task => task.priority === 'high');
  const todayTasks = dayJobTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8" />
            Day Job
          </h1>
          <p className="text-muted-foreground">Head of Talent Management at Socially Powerful</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Critical tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks due today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Talent Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talentLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              Talent opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dayJobTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Total work tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>High Priority Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriorityTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.dueDate && `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {highPriorityTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No high priority tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.description && task.description.slice(0, 50) + '...'}
                    </p>
                  </div>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                </div>
              ))}
              {todayTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No tasks due today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Talent Management Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Recruitment</h4>
              <p className="text-sm text-muted-foreground">
                Sourcing and interviewing top talent for key positions
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Team Development</h4>
              <p className="text-sm text-muted-foreground">
                Training programs and career development initiatives
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Performance Management</h4>
              <p className="text-sm text-muted-foreground">
                Reviews, feedback, and performance improvement plans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}