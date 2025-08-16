import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Users, CheckSquare, Calendar as CalendarIcon, Zap } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";

interface DashboardStats {
  totalLeads: number;
  totalClients: number;
  activeTasks: number;
  completedTasks: number;
  activeProjects: number;
  completionRate: number;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-32">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="card__content">
              <div className="skeleton" style={{ height: '80px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Followers",
      value: "1.28M",
      delta: "+12.5%",
      trend: "up" as const,
      icon: TrendingUp,
      chart: [40, 45, 38, 52, 48, 60, 55, 67, 72, 58, 65, 70]
    },
    {
      title: "Win Rate", 
      value: "38%",
      delta: "+5.2%",
      trend: "up" as const,
      icon: Target,
      chart: [25, 30, 28, 35, 32, 38, 35, 42, 38, 40, 36, 38]
    },
    {
      title: "Utilization",
      value: "71%", 
      delta: "-2.1%",
      trend: "down" as const,
      icon: Users,
      chart: [75, 78, 72, 68, 73, 71, 69, 74, 71, 68, 72, 71]
    }
  ];

  const todayTasks = [
    {
      title: "Prep Ninja BBQ creative treatment",
      priority: "high" as const,
      due: "Due 3pm",
      context: "Creative"
    },
    {
      title: "Follow up: GDK experimental kit",
      priority: "medium" as const, 
      due: "Due 5pm",
      context: "Business"
    },
    {
      title: "Record: BTS Minisode 4",
      priority: "urgent" as const,
      due: "Due 7pm", 
      context: "Podcast"
    }
  ];

  const activeProjects = [
    {
      title: "Don't Get Me Started",
      progress: 62,
      status: "In Progress",
      cover: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Behind the Screens", 
      progress: 45,
      status: "Recording",
      cover: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "WhatInTheChef × Ninja",
      progress: 30,
      status: "Planning",
      cover: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      title: "ImCursed Store",
      progress: 78,
      status: "Launch Ready",
      cover: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    }
  ];

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNumber = i - 6; // Start from previous month
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= 31;
    const isToday = dayNumber === 15; // Mock today
    const hasTasks = [8, 12, 15, 18, 22, 25, 28].includes(dayNumber);
    
    return {
      day: dayNumber > 0 ? dayNumber : '',
      isCurrentMonth,
      isToday,
      hasTasks,
      taskCount: hasTasks ? Math.floor(Math.random() * 3) + 1 : 0
    };
  });

  return (
    <AppShell>
      <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Dashboard</h1>
          <p className="text-meta">Welcome back, Curtis. Here's what's happening today.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className={`card ${index === 0 ? 'md:col-span-2' : ''}`}>
              <div className="card__content">
                <div className="flex items-center justify-between mb-16">
                  <div>
                    <h3 className="text-meta mb-8">{metric.title.toUpperCase()}</h3>
                    <p className="text-h2 mb-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {metric.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className={`glass-pill ${metric.trend === 'up' ? 'glass-pill--selected' : ''}`}>
                      {metric.delta}
                    </div>
                    <Icon className="w-8 h-8" style={{ color: 'var(--action-cyan-500)' }} />
                  </div>
                </div>
                
                <div className="spark">
                  <div className="spark__bars">
                    {metric.chart.map((height, i) => (
                      <div 
                        key={i} 
                        className="spark__bar" 
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* My Day */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">My Day</h3>
            <p className="card__meta">3 tasks scheduled</p>
          </div>
          <div className="card__content">
            <div className="space-y-12">
              {todayTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-12">
                  <div className={`priority-spine priority--${task.priority}`} style={{ height: '40px' }}></div>
                  <div className="flex-1">
                    <p className="text-body mb-4">{task.title}</p>
                    <div className="flex items-center gap-8">
                      <div className="glass-pill">{task.due}</div>
                      <div className="glass-pill">{task.context}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Calendar Preview</h3>
            <p className="card__meta">November 2024</p>
          </div>
          <div className="card__content">
            <div className="grid grid-cols-7 gap-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`day-header-${index}`} className="text-center text-meta p-8">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`
                    text-center p-8 rounded-lg text-sm relative
                    ${day.isCurrentMonth ? 'text-ink-200' : 'text-ink-400'}
                    ${day.isToday ? 'ring-1 ring-alert-yellow-500' : ''}
                    ${day.hasTasks ? 'bg-action-cyan-500 bg-opacity-15' : ''}
                  `}
                >
                  {day.day}
                  {day.hasTasks && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" 
                         style={{ background: 'var(--action-cyan-500)' }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Active Projects</h3>
          <p className="card__meta">4 projects in progress</p>
        </div>
        <div className="card__content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {activeProjects.map((project, i) => (
              <div key={i} className="flex items-center gap-16 p-12 rounded-lg" 
                   style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                <div 
                  className="w-14 h-14 rounded-lg"
                  style={{ background: project.cover }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-medium text-ink-200">{project.title}</h4>
                    <div className="glass-pill glass-pill--selected">{project.status}</div>
                  </div>
                  <div className="capsule-bar">
                    <div className="capsule-bar__fill" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <p className="text-meta mt-4">Progress {project.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}