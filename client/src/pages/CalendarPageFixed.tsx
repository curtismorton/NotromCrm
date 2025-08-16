import { useState } from "react";
import { Calendar, Plus, Clock, ChevronLeft, ChevronRight, Filter, Grid, List } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  category: "meeting" | "deadline" | "appointment" | "reminder" | "personal";
  priority: "high" | "medium" | "low";
  description?: string;
}

export default function CalendarPageFixed() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  // Mock calendar events
  const calendarEvents: CalendarEvent[] = [
    {
      id: 1,
      title: "Client Meeting - Holly × GDK",
      time: "09:00 AM",
      category: "meeting",
      priority: "high",
      description: "Discuss experimental series project brief"
    },
    {
      id: 2,
      title: "Podcast Recording Session",
      time: "02:00 PM",
      category: "appointment",
      priority: "medium",
      description: "Behind The Screens Episode 47"
    },
    {
      id: 3,
      title: "Notrom Project Deadline",
      time: "11:59 PM",
      category: "deadline",
      priority: "high",
      description: "Submit final deliverables"
    },
    {
      id: 4,
      title: "Team Standup - Day Job",
      time: "10:30 AM",
      category: "meeting",
      priority: "medium",
      description: "Weekly team sync at Socially Powerful"
    }
  ];

  const todayEvents = calendarEvents.filter(event => {
    // Mock logic - in real app would check actual dates
    return true;
  });

  const upcomingEvents = calendarEvents.filter(event => {
    // Mock logic - in real app would check upcoming dates
    return true;
  });

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "meeting": return "glass-pill--selected";
      case "deadline": return "glass-pill";
      case "appointment": return "glass-pill--selected";
      default: return "glass-pill";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high": return "priority--urgent";
      case "medium": return "priority--high";
      default: return "priority--medium";
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Generate calendar days for the current month
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: '', isEmpty: true });
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const hasEvents = Math.random() > 0.7; // Mock events
    const isToday = day === new Date().getDate() && 
                   currentDate.getMonth() === new Date().getMonth() &&
                   currentYear === new Date().getFullYear();
    
    calendarDays.push({
      day: day.toString(),
      isEmpty: false,
      hasEvents,
      isToday,
      eventCount: hasEvents ? Math.floor(Math.random() * 3) + 1 : 0
    });
  }

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Calendar</h1>
          <p className="text-meta">Manage your schedule and upcoming events.</p>
        </div>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-8">
            <button 
              className={`btn btn--small ${viewMode === "month" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setViewMode("month")}
            >
              <Grid className="w-4 h-4" />
              Month
            </button>
            <button 
              className={`btn btn--small ${viewMode === "week" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setViewMode("week")}
            >
              <List className="w-4 h-4" />
              Week
            </button>
          </div>
          <button className="btn btn--primary btn--small">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-24">
        {/* Calendar View */}
        <div className="col-span-3 space-y-24">
          {/* Calendar Header */}
          <div className="card">
            <div className="card__header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-12">
                  <button className="btn btn--secondary btn--small">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="card__title">{currentMonth} {currentYear}</h3>
                  <button className="btn btn--secondary btn--small">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-8">
                  <div className="glass-pill">
                    <Clock className="w-4 h-4" />
                    Today
                  </div>
                </div>
              </div>
            </div>
            <div className="card__content">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-4">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={`header-${index}`} className="text-center text-meta p-8 font-medium">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((dayData, index) => (
                  <div
                    key={`day-${index}`}
                    className={`
                      p-8 min-h-16 text-center rounded-lg border cursor-pointer transition-all
                      ${dayData.isEmpty ? 'border-transparent' : 'border-border-1 hover:bg-surface-2'}
                      ${dayData.isToday ? 'ring-2 ring-action-cyan-500 bg-action-cyan-500 bg-opacity-15' : ''}
                      ${dayData.hasEvents ? 'bg-surface-2' : ''}
                    `}
                    style={{
                      borderColor: dayData.isEmpty ? 'transparent' : 'var(--border-1)'
                    }}
                  >
                    <div className="text-sm text-ink-200 font-medium">{dayData.day}</div>
                    {dayData.hasEvents && (
                      <div className="mt-4 flex justify-center">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'var(--action-cyan-500)' }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Today's Events & Upcoming */}
        <div className="col-span-1 space-y-24">
          {/* Today's Events */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Today's Events</h3>
              <div className="glass-pill">{todayEvents.length}</div>
            </div>
            <div className="card__content">
              <div className="space-y-12">
                {todayEvents.length > 0 ? (
                  todayEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-12">
                      <div className={`priority-spine ${getPriorityClass(event.priority)}`} style={{ height: '40px' }}></div>
                      <div className="flex-1">
                        <p className="text-body font-medium text-ink-200 mb-4">{event.title}</p>
                        <div className="flex items-center gap-8 mb-8">
                          <div className="glass-pill">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                          <div className={`glass-pill ${getCategoryClass(event.category)}`}>
                            {event.category}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-meta text-sm">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="w-12 h-12 mx-auto mb-8 text-ink-400" />
                    <p className="text-meta">No events scheduled for today</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">This Week</h3>
              <div className="glass-pill">{upcomingEvents.length}</div>
            </div>
            <div className="card__content">
              <div className="space-y-12">
                {upcomingEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-start gap-12 p-8 rounded-lg hover:bg-surface-2 transition-colors">
                    <div className={`priority-spine ${getPriorityClass(event.priority)}`} style={{ height: '30px' }}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-200 mb-2">{event.title}</p>
                      <div className="flex items-center gap-6">
                        <span className="text-meta text-xs">{event.time}</span>
                        <div className={`glass-pill text-xs ${getCategoryClass(event.category)}`}>
                          {event.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}