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
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Day-to-Day Work</h1>
          <p className="text-meta">Your personal workspace for daily tasks, career goals, and life management.</p>
        </div>
        <div className="flex items-center gap-12">
          <Briefcase className="w-8 h-8" style={{ color: 'var(--ok-500)' }} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-24">
        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Daily Tasks</p>
                <p className="text-3xl font-bold text-ink-200">0</p>
              </div>
              <CheckSquare className="w-8 h-8" style={{ color: 'var(--ok-500)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Podcast Episodes</p>
                <p className="text-3xl font-bold text-ink-200">0</p>
              </div>
              <Mic className="w-8 h-8" style={{ color: 'var(--warn-500)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Day Job Tasks</p>
                <p className="text-3xl font-bold text-ink-200">0</p>
              </div>
              <Briefcase className="w-8 h-8" style={{ color: 'var(--action-cyan-500)' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-meta">Personal Goals</p>
                <p className="text-3xl font-bold text-ink-200">0</p>
              </div>
              <Target className="w-8 h-8" style={{ color: 'var(--danger-500)' }} />
            </div>
          </div>
        </div>
        </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
        <Link href="/work/tasks">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <CheckSquare className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--ok-500)' }} />
              <h3 className="card__title">Personal Tasks</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Manage your daily personal and general work tasks
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">0 tasks</div>
              </div>
            </div>
          </div>
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