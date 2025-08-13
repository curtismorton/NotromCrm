import { motion } from "framer-motion";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { Building2, Briefcase, Zap } from "lucide-react";

const workspaceIcons = {
  notrom: Building2,
  work: Briefcase,
  legacy: Zap
};

const workspaceGradients = {
  notrom: "from-blue-600 to-blue-700",
  work: "from-emerald-600 to-emerald-700", 
  legacy: "from-gray-600 to-gray-700"
};

export function WorkspaceHeader() {
  const { currentWorkspace } = useWorkspace();
  const Icon = workspaceIcons[currentWorkspace.id];
  
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
          <p className="text-xs text-white/80">{currentWorkspace.description}</p>
        </div>
      </div>
    </motion.div>
  );
}