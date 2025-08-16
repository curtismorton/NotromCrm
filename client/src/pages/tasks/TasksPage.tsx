import { useState } from "react";
import { Link } from "wouter";
import { TaskCardList } from "@/components/modules/tasks/TaskCardList";
import { TaskModal } from "@/components/modules/tasks/TaskModal";
import { BulkTaskActions } from "@/components/productivity/BulkTaskActions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Building2, Briefcase, Mic, Home, CheckSquare, AlertTriangle, Clock, Loader2, FileText, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { useQuickFilters } from "@/hooks/use-quick-filters";
import { getTaskCounts, getOverdueTasks, getDueTodayTasks, getHighPriorityTasks } from "@/lib/utils/taskHelpers";

export default function TasksPage() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  
  const { data: allTasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { currentFilter, filterTasks } = useQuickFilters();
  const tasks = currentFilter ? filterTasks(allTasks) : allTasks;
  
  // Use helper functions for consistent counts
  const taskCounts = getTaskCounts(allTasks);
  const overdueTasks = getOverdueTasks(allTasks);
  const todayTasks = getDueTodayTasks(allTasks);
  const highPriorityTasks = getHighPriorityTasks(allTasks);

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load tasks</h2>
          <p className="text-muted-foreground">There was an error loading your tasks. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="text-3xl">✅</span>
            Task Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Organize and track tasks across all your life and work contexts
          </p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
          {currentFilter && (
            <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
              <Link href="/tasks">
                Clear Filter
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/tasks?filter=overdue">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Overdue ({overdueTasks.length})
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/tasks?filter=today">
              <Clock className="w-4 h-4 mr-2" />
              Due Today ({todayTasks.length})
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/tasks/templates">
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Task
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-900">{overdueTasks.length}</p>
              <p className="text-sm text-red-700">Overdue</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-900">{todayTasks.length}</p>
              <p className="text-sm text-orange-700">Due Today</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-2xl font-bold text-purple-900">{highPriorityTasks.length}</p>
              <p className="text-sm text-purple-700">High Priority</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{tasks.length}</p>
              <p className="text-sm text-green-700">Total Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Tasks Alert */}
      {(overdueTasks.length > 0 || todayTasks.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Attention Required</h3>
          </div>
          <p className="text-sm text-red-700">
            {overdueTasks.length > 0 && `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`}
            {overdueTasks.length > 0 && todayTasks.length > 0 && ' and '}
            {todayTasks.length > 0 && `${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today`}
          </p>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkTaskActions 
        tasks={tasks}
        selectedTasks={selectedTasks}
        onSelectionChange={setSelectedTasks}
        onActionComplete={() => {
          // Refresh task counts after bulk actions
        }}
      />

      {/* Tabbed Task Views */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-1 text-xs sm:text-sm">
            <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>All</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {tasks.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notrom" className="flex items-center gap-1 text-xs sm:text-sm">
            <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Notrom</span>
            <span className="sm:hidden">Not.</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {taskCounts.notrom}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="podcast" className="flex items-center gap-1 text-xs sm:text-sm">
            <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Podcast</span>
            <span className="sm:hidden">Pod.</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {taskCounts.podcast}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="day_job" className="flex items-center gap-1 text-xs sm:text-sm">
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Day Job</span>
            <span className="sm:hidden">Job</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {taskCounts.dayJob}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1 text-xs sm:text-sm">
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen.</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {taskCounts.general}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              📋 <strong>All tasks</strong> across your unified workflow. Cards are color-coded by context and show priority, status, and deadlines.
            </p>
          </div>
          <TaskCardList context="all" />
        </TabsContent>

        <TabsContent value="notrom" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Notrom Business Tasks</h4>
                <p className="text-sm text-blue-700">
                  Web development side hustle - client work, marketing, and business development
                </p>
              </div>
            </div>
          </div>
          <TaskCardList context="notrom" />
        </TabsContent>

        <TabsContent value="podcast" className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-semibold text-purple-900">Behind The Screens Podcast</h4>
                <p className="text-sm text-purple-700">
                  Content creation, recording, editing, and publishing tasks
                </p>
              </div>
            </div>
          </div>
          <TaskCardList context="podcast" />
        </TabsContent>

        <TabsContent value="day_job" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Day Job Tasks</h4>
                <p className="text-sm text-green-700">
                  Head of Talent Management at Socially Powerful - recruitment and HR tasks
                </p>
              </div>
            </div>
          </div>
          <TaskCardList context="day_job" />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-900">General Tasks</h4>
                <p className="text-sm text-gray-700">
                  Personal tasks, life admin, and other general activities
                </p>
              </div>
            </div>
          </div>
          <TaskCardList context="general" />
        </TabsContent>
      </Tabs>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
      />
    </div>
  );
}
