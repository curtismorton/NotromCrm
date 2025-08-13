import { useState } from "react";
import { Link, useLocation, Switch, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  CheckSquare, 
  Mic,
  Home,
  Calendar,
  Target,
  BookOpen,
  Coffee,
  Plus,
  Clock,
  Heart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Import individual pages
import TasksPage from "@/pages/tasks/TasksPage";
import PodcastPage from "@/pages/PodcastPage";
import DayJobPage from "@/pages/DayJobPage";
import CalendarPage from "@/pages/CalendarPage";
import GoalsPage from "@/pages/GoalsPage";
import LifeTrackingPage from "@/pages/LifeTrackingPage";

function WorkDashboard() {
  const { data: stats } = useQuery<{
    totalLeads: number;
    activeProjects: number;
    totalClients: number;
    totalTasks: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Briefcase className="w-12 h-12 text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">Day-to-Day Work</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal workspace for daily tasks, career goals, and life management
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Daily Tasks</p>
                  <p className="text-3xl font-bold text-emerald-900">0</p>
                </div>
                <CheckSquare className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Podcast Episodes</p>
                  <p className="text-3xl font-bold text-purple-900">0</p>
                </div>
                <Mic className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Day Job Tasks</p>
                  <p className="text-3xl font-bold text-blue-900">0</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Personal Goals</p>
                  <p className="text-3xl font-bold text-orange-900">0</p>
                </div>
                <Target className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/work/tasks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300">
              <CardHeader className="text-center pb-4">
                <CheckSquare className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
                <CardTitle className="text-xl">Personal Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Manage your daily personal and general work tasks
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 tasks</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/work/podcast">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300">
              <CardHeader className="text-center pb-4">
                <Mic className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                <CardTitle className="text-xl">Behind The Screens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Plan, record, and manage your podcast production
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 episodes</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/work/day-job">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
              <CardHeader className="text-center pb-4">
                <Briefcase className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-xl">Socially Powerful</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Track your Head of Talent Management responsibilities
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 tasks</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/work/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-indigo-300">
              <CardHeader className="text-center pb-4">
                <Calendar className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
                <CardTitle className="text-xl">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  View your personal calendar and upcoming events
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 events today</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/work/goals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-300">
              <CardHeader className="text-center pb-4">
                <Target className="w-16 h-16 mx-auto text-orange-600 mb-4" />
                <CardTitle className="text-xl">Goals & Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Set and track personal and professional goals
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 goals</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/work/habits">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
              <CardHeader className="text-center pb-4">
                <Heart className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <CardTitle className="text-xl">Life Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">
                  Track habits, meals, expenses, and personal metrics
                </p>
                <div className="flex justify-center">
                  <Badge variant="secondary">0 entries</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </Button>
          <Button size="lg" variant="outline">
            <Clock className="w-5 h-5 mr-2" />
            Start Timer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkWorkspace() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/work" component={WorkDashboard} />
      <Route path="/work/tasks" component={TasksPage} />
      <Route path="/work/tasks/:id" component={TasksPage} />
      <Route path="/work/podcast" component={PodcastPage} />
      <Route path="/work/dayjob" component={DayJobPage} />
      <Route path="/work/day-job" component={DayJobPage} />
      <Route path="/work/calendar" component={CalendarPage} />
      <Route path="/work/goals" component={GoalsPage} />
      <Route path="/work/habits" component={LifeTrackingPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/podcast" component={PodcastPage} />
      <Route path="/day-job" component={DayJobPage} />
      <Route path="/dayjob" component={DayJobPage} />
      <Route path="/" component={WorkDashboard} />
      <Route component={WorkDashboard} />
    </Switch>
  );
}