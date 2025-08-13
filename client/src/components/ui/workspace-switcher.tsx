import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Briefcase, 
  ChevronDown,
  ArrowRightLeft,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/hooks/use-workspace";

const workspaceIcons = {
  notrom: <Building2 className="w-4 h-4" />,
  work: <Briefcase className="w-4 h-4" />
};

export function WorkspaceSwitcher() {
  const [location, navigate] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { currentWorkspace, allWorkspaces } = useWorkspace();

  const handleWorkspaceSwitch = async (workspace: any) => {
    if (workspace.id === currentWorkspace.id || isTransitioning) return;

    setIsTransitioning(true);
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    navigate(workspace.path);
    
    // Complete transition
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-auto p-3 justify-start gap-3 min-w-[240px] transition-all duration-200",
              currentWorkspace.bgColor,
              currentWorkspace.borderColor,
              currentWorkspace.color,
              "border hover:shadow-md",
              isTransitioning && "opacity-75 cursor-not-allowed"
            )}
            disabled={isTransitioning}
          >
            <motion.div
              key={currentWorkspace.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 flex-1"
            >
              {isTransitioning ? (
                <ArrowRightLeft className="w-4 h-4 animate-pulse" />
              ) : (
                workspaceIcons[currentWorkspace.id]
              )}
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">
                  {isTransitioning ? 'Switching...' : currentWorkspace.name}
                </span>
                <span className="text-xs opacity-70 truncate max-w-[160px]">
                  {currentWorkspace.description}
                </span>
              </div>
            </motion.div>
            <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-80 p-2">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Switch Workspace
          </div>
          <DropdownMenuSeparator />
          
          <AnimatePresence>
            {allWorkspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <DropdownMenuItem
                  onClick={() => handleWorkspaceSwitch(workspace)}
                  className={cn(
                    "p-0 cursor-pointer",
                    workspace.id === currentWorkspace.id && "bg-gray-50"
                  )}
                  disabled={workspace.id === currentWorkspace.id || isTransitioning}
                >
                  <Card className={cn(
                    "w-full border-0 shadow-none hover:shadow-sm transition-all duration-200",
                    workspace.id === currentWorkspace.id && workspace.bgColor
                  )}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
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
                    </CardContent>
                  </Card>
                </DropdownMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg border flex items-center gap-3"
            >
              <ArrowRightLeft className="w-5 h-5 animate-spin text-blue-600" />
              <span className="font-medium text-gray-900">Switching workspace...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}