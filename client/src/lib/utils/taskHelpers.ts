import { Task } from "@shared/schema";

export function getTaskCounts(tasks: Task[]) {
  const counts = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    archived: tasks.filter(t => t.status === 'archived').length,
    overdue: tasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'archived';
    }).length,
    dueToday: tasks.filter(task => {
      if (!task.dueDate) return false;
      const today = new Date();
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === today.toDateString() && task.status !== 'completed' && task.status !== 'archived';
    }).length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed' && t.status !== 'archived').length,
    // Context-specific counts
    notrom: tasks.filter(t => t.context === 'notrom').length,
    podcast: tasks.filter(t => t.context === 'podcast').length,
    dayJob: tasks.filter(t => t.context === 'day_job').length,
    general: tasks.filter(t => t.context === 'general').length,
  };

  return counts;
}

export function getTasksByContext(tasks: Task[], context: string) {
  if (context === 'all') return tasks;
  return tasks.filter(task => task.context === context);
}

export function getTasksByStatus(tasks: Task[], status: string) {
  return tasks.filter(task => task.status === status);
}

export function getOverdueTasks(tasks: Task[]) {
  return tasks.filter(task => {
    return task.dueDate && 
           new Date(task.dueDate) < new Date() && 
           task.status !== 'completed' && 
           task.status !== 'archived';
  });
}

export function getDueTodayTasks(tasks: Task[]) {
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString() && 
           task.status !== 'completed' && 
           task.status !== 'archived';
  });
}

export function getHighPriorityTasks(tasks: Task[]) {
  return tasks.filter(task => 
    task.priority === 'high' && 
    task.status !== 'completed' && 
    task.status !== 'archived'
  );
}