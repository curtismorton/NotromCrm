import {
  format as formatDateFns,
  formatDistanceToNow,
  isToday,
  isPast,
  differenceInCalendarDays,
} from "date-fns";

// Format date to display in a readable format
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "N/A";
  return formatDateFns(new Date(date), "MMM d, yyyy");
};

// Format date for input fields
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return "";
  return formatDateFns(new Date(date), "yyyy-MM-dd");
};

// Format currency value
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format time ago
export const formatTimeAgo = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Get appropriate status for due dates
export const getDueDateStatus = (dueDate: string | null | undefined) => {
  if (!dueDate) return { status: "none", label: "No due date" };
  
  const date = new Date(dueDate);
  if (isPast(date) && !isToday(date)) {
    return { status: "overdue", label: `Overdue: ${formatDateFns(date, "MMM d")}` };
  }
  if (isToday(date)) {
    return { status: "today", label: "Due today" };
  }
  const diff = differenceInCalendarDays(date, new Date());
  if (diff > 0 && diff <= 3) {
    return { status: "soon", label: `Due ${formatDateFns(date, "MMM d")}` };
  }
  
  return { status: "normal", label: formatDateFns(date, "MMM d, yyyy") };
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
