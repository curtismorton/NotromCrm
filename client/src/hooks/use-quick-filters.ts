import { useLocation } from "wouter";
import { Task, Lead } from "@shared/schema";

export function useQuickFilters() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const filter = urlParams.get('filter');

  const filterTasks = (tasks: Task[]) => {
    if (!filter) return tasks;
    
    switch (filter) {
      case 'overdue':
        return tasks.filter(task => {
          return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        });
      
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const today = new Date();
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === today.toDateString();
        });
      
      case 'priority':
        return tasks.filter(task => task.priority === 'high' && task.status !== 'completed');
      
      default:
        return tasks;
    }
  };

  const filterLeads = (leads: Lead[]) => {
    if (!filter) return leads;
    
    switch (filter) {
      case 'high_priority':
        return leads.filter(lead => lead.priority === 'high');
      
      case 'contacted':
        return leads.filter(lead => 
          ['contacted', 'call_booked', 'build_in_progress', 'awaiting_feedback'].includes(lead.status)
        );
      
      default:
        return leads;
    }
  };

  return {
    currentFilter: filter,
    filterTasks,
    filterLeads,
  };
}