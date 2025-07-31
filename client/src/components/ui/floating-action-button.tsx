import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  CheckSquare, 
  Target, 
  X, 
  PlusCircle,
  Clock,
  Star,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      icon: CheckSquare,
      label: "New Task",
      href: "/tasks/new",
      color: "bg-blue-500 hover:bg-blue-600 text-white",
      description: "Create a new task"
    },
    {
      icon: Target,
      label: "New Lead",
      href: "/leads/new", 
      color: "bg-green-500 hover:bg-green-600 text-white",
      description: "Add a new lead"
    },
    {
      icon: Clock,
      label: "Due Today",
      href: "/tasks?filter=today",
      color: "bg-orange-500 hover:bg-orange-600 text-white",
      description: "View today's tasks"
    },
    {
      icon: Star,
      label: "High Priority",
      href: "/tasks?filter=priority",
      color: "bg-red-500 hover:bg-red-600 text-white",
      description: "High priority items"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick action buttons */}
      <div className={cn(
        "flex flex-col items-end gap-3 mb-3 transition-all duration-300 ease-in-out",
        isOpen ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4 pointer-events-none"
      )}>
        {quickActions.map((action, index) => (
          <div
            key={action.label}
            className={cn(
              "transition-all duration-300 ease-in-out",
              isOpen 
                ? `opacity-100 transform translate-y-0 delay-${index * 50}` 
                : "opacity-0 transform translate-y-4"
            )}
          >
            <div className="flex items-center gap-3">
              {/* Label */}
              <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                {action.description}
              </div>
              
              {/* Action button */}
              <Link href={action.href}>
                <Button
                  size="sm"
                  className={cn(
                    "rounded-full w-12 h-12 shadow-lg transition-all duration-200",
                    action.color
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <action.icon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Main FAB toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "rounded-full w-14 h-14 shadow-lg transition-all duration-300 ease-in-out",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-45"
        )}
        size="lg"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Zap className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}