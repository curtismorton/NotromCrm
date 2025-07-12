import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Play, Calendar, Clock, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Task } from "@shared/schema";

export default function PodcastPage() {
  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter for podcast-related tasks
  const podcastTasks = tasks?.filter(task => 
    task.context === 'podcast' ||
    task.title?.toLowerCase().includes('podcast') ||
    task.title?.toLowerCase().includes('behind the screens') ||
    task.description?.toLowerCase().includes('podcast')
  ) || [];

  const upcomingTasks = podcastTasks.filter(task => task.status === 'todo');
  const inProgressTasks = podcastTasks.filter(task => task.status === 'in_progress');
  const completedTasks = podcastTasks.filter(task => task.status === 'completed');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic className="w-8 h-8" />
            Podcast
          </h1>
          <p className="text-muted-foreground">Behind The Screens episode management</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Episode
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planning</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Episodes in planning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Recording or editing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Episodes published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{podcastTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              All podcast tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.dueDate && `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming episodes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.description && task.description.slice(0, 50) + '...'}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {task.status}
                  </Badge>
                </div>
              ))}
              {inProgressTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No episodes in progress</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Episode Ideas & Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use this space to jot down episode ideas, guest suggestions, or production notes.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                💡 Future episodes: Tech industry trends, Developer productivity, Remote work challenges
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}