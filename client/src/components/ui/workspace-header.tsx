import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { Building2, Briefcase, ChevronDown, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const workspaceIcons: Record<string, any> = {
  notrom: Building2,
  work: Briefcase
};

const workspaceGradients = {
  notrom: "from-blue-600 to-blue-700",
  work: "from-emerald-600 to-emerald-700"
};

export function WorkspaceHeader() {
  const { currentWorkspace, allWorkspaces } = useWorkspace();
  const [location, navigate] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const Icon = workspaceIcons[currentWorkspace.id];

  const handleWorkspaceSwitch = async (workspace: any) => {
    if (workspace.id === currentWorkspace.id || isTransitioning) return;

    console.log('Header: Switching workspace from', currentWorkspace.id, 'to', workspace.id);
    setIsTransitioning(true);
    
    navigate(workspace.path);
    
    setTimeout(() => setIsTransitioning(false), 300);
  };
  
  return (
    <motion.div
      key={currentWorkspace.id}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-16 px-4 flex items-center justify-between bg-gradient-to-r text-white border-b",
        workspaceGradients[currentWorkspace.id]
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-sm">{currentWorkspace.name}</h2>
          <p className="text-xs text-white/80 hidden sm:block">{currentWorkspace.description}</p>
        </div>
      </div>

      {/* Mobile and Desktop Workspace Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30"
            disabled={isTransitioning}
          >
            {isTransitioning ? (
              <ArrowRightLeft className="w-4 h-4 animate-pulse mr-2" />
            ) : (
              <Building2 className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Switch</span>
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-2">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Switch Workspace
          </div>
          <DropdownMenuSeparator />
          
          {allWorkspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Header dropdown clicked for:', workspace.id);
                handleWorkspaceSwitch(workspace);
              }}
              className={cn(
                "p-0 cursor-pointer",
                workspace.id === currentWorkspace.id && "bg-gray-50"
              )}
              disabled={workspace.id === currentWorkspace.id || isTransitioning}
            >
              <div className={cn(
                "w-full p-3 flex items-center gap-3 rounded-lg transition-colors",
                workspace.id === currentWorkspace.id && workspace.bgColor
              )}>
                <div className={cn(
                  "p-2 rounded-lg",
                  workspace.bgColor,
                  workspace.borderColor,
                  "border"
                )}>
                  <span className={workspace.color}>
                    {workspaceIcons[workspace.id]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{workspace.name}</h4>
                    {workspace.id === currentWorkspace.id && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {workspace.description}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}