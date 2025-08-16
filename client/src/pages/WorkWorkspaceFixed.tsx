import { useState } from "react";
import { Link, useLocation, Switch, Route } from "wouter";
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
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Mic className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--warn-500)' }} />
              <h3 className="card__title">Behind The Screens</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Plan, record, and manage your podcast production
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">0 episodes</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/work/day-job">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--action-cyan-500)' }} />
              <h3 className="card__title">Socially Powerful</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Track your Head of Talent Management responsibilities
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">0 tasks</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/work/goals">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Target className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--danger-500)' }} />
              <h3 className="card__title">Goals & Habits</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Set and track personal and professional goals
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">0 goals</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/work/life-tracking">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Heart className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--warn-500)' }} />
              <h3 className="card__title">Life Tracking</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Monitor wellness, habits, and personal metrics
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">View Metrics</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/calendar">
          <div className="card cursor-pointer transition-all hover:scale-105">
            <div className="card__header text-center">
              <Calendar className="w-16 h-16 mx-auto mb-16" style={{ color: 'var(--action-cyan-500)' }} />
              <h3 className="card__title">Calendar & Schedule</h3>
            </div>
            <div className="card__content">
              <p className="text-meta text-center mb-16">
                Manage personal schedule and appointments
              </p>
              <div className="flex justify-center">
                <div className="glass-pill">View Schedule</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function WorkWorkspaceFixed() {
  return <WorkDashboard />;
}