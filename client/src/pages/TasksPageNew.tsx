import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, List, LayoutGrid, FileText, BarChart3, Filter } from "lucide-react";
import { Task } from "@shared/schema";
import { format, isToday, isPast, parseISO } from "date-fns";
import { BulkTaskActions } from "@/components/productivity/BulkTaskActions";
import { AppShell } from "@/components/ui/AppShell";

type ViewMode = "list" | "kanban";
type TabType = "my-day" | "next" | "waiting" | "someday";

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeTab, setActiveTab] = useState<TabType>("my-day");
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const { data: allTasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  if (isLoading) {
    return (
      <div className="space-y-24">
        <div className="skeleton" style={{ height: '60px' }}></div>
        <div className="skeleton" style={{ height: '200px' }}></div>
      </div>
    );
  }

  const filterTasksByTab = (tasks: Task[], tab: TabType): Task[] => {
    const today = new Date();
    
    switch (tab) {
      case "my-day":
        return tasks.filter(task => 
          task.status !== "completed" && (
            !task.dueDate || 
            isToday(task.dueDate) ||
            isPast(task.dueDate)
          )
        );
      case "next":
        return tasks.filter(task => 
          task.status === "todo" && task.dueDate && !isToday(task.dueDate) && !isPast(task.dueDate)
        );
      case "waiting":
        return tasks.filter(task => task.status === "in_progress");
      case "someday":
        return tasks.filter(task => task.status === "archived");
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasksByTab(allTasks, activeTab);

  const getPriorityClass = (priority: string | null) => {
    switch (priority) {
      case "high": return "priority--high";
      case "urgent": return "priority--urgent"; 
      default: return "priority--medium";
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed": return "badge--status-completed";
      case "in_progress": return "badge--priority-high";
      default: return "";
    }
  };

  const tabs = [
    { id: "my-day" as const, label: "My Day", count: filterTasksByTab(allTasks, "my-day").length },
    { id: "next" as const, label: "Next", count: filterTasksByTab(allTasks, "next").length },
    { id: "waiting" as const, label: "Waiting", count: filterTasksByTab(allTasks, "waiting").length },
    { id: "someday" as const, label: "Someday", count: filterTasksByTab(allTasks, "someday").length },
  ];

  return (
    <AppShell>
      <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Tasks</h1>
          <p className="text-meta">Organize and prioritize your work across all contexts.</p>
        </div>
        <div className="flex items-center gap-12">
          <button className="btn btn--secondary btn--small">
            <FileText className="w-4 h-4" />
            Templates
          </button>
          <button className="btn btn--secondary btn--small">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button className="btn btn--primary">
            <PlusCircle className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-16 py-8 text-sm font-medium transition-all duration-160 rounded-lg ${
                activeTab === tab.id 
                  ? 'bg-action-cyan-500 bg-opacity-20 text-ink-100 glow-cyan' 
                  : 'text-ink-300 hover:text-ink-200 hover:bg-surface-2'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-8 px-6 py-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-surface-2' : 'bg-surface-3'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-12">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
            className="btn btn--secondary btn--small"
          >
            {viewMode === "list" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {viewMode === "list" ? "Kanban" : "List"}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <BulkTaskActions
          tasks={allTasks}
          selectedTasks={selectedTasks}
          onSelectionChange={setSelectedTasks}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              {tabs.find(t => t.id === activeTab)?.label} — List
            </h3>
          </div>
          <div className="card__content p-0">
            <table className="table">
              <thead className="table__header">
                <tr>
                  <th className="table__header-cell" style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(filteredTasks.map(t => t.id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                    />
                  </th>
                  <th className="table__header-cell">Task</th>
                  <th className="table__header-cell">Due</th>
                  <th className="table__header-cell">Assignee</th>
                  <th className="table__header-cell">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr 
                    key={task.id}
                    className={`table__row ${selectedTasks.includes(task.id) ? 'table__row--selected' : ''}`}
                  >
                    <td className="table__cell">
                      <div className="flex items-center gap-12">
                        <div className={`priority-spine ${task.priority ? getPriorityClass(task.priority) : 'priority--medium'}`} style={{ height: '32px' }}></div>
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="table__cell">
                      <div>
                        <p className="font-medium text-ink-200">{task.title}</p>
                        {task.description && (
                          <p className="text-meta text-sm mt-2">{task.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="table__cell">
                      {task.dueDate && (
                        <div className={`badge ${isPast(task.dueDate) && task.status !== 'completed' ? 'badge--priority-urgent' : ''}`}>
                          {format(task.dueDate, 'MMM dd')}
                        </div>
                      )}
                    </td>
                    <td className="table__cell">
                      <div className="text-ink-300">{task.assignedTo || 'Unassigned'}</div>
                    </td>
                    <td className="table__cell">
                      <div className={`badge ${task.status ? getStatusBadge(task.status) : ''}`}>
                        {task.priority === "high" && (
                          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--warn-500)' }}></span>
                        )}
                        {task.status?.replace('_', ' ').toUpperCase() || 'TODO'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Board — Grouped by Project</h3>
          </div>
          <div className="card__content">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
              {["My Day", "Next", "Waiting", "Someday"].map((column) => (
                <div key={column} className="space-y-12">
                  <h4 className="text-meta font-medium">{column.toUpperCase()}</h4>
                  <div className="space-y-8">
                    {/* Mock task cards for kanban view */}
                    {[1, 2].map((i) => (
                      <div key={i} className="p-12 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                        <div className="flex items-start gap-8 mb-8">
                          <div className="priority-spine priority--medium" style={{ height: '20px' }}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-ink-200 mb-4">Task name</p>
                            <div className="glass-pill">Context</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </AppShell>
  );
}