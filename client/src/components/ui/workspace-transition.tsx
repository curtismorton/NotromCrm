import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { useLocation } from "wouter";

interface WorkspaceTransitionProps {
  children: ReactNode;
}

export function WorkspaceTransition({ children }: WorkspaceTransitionProps) {
  const [location] = useLocation();

  // Get workspace-specific transition configs
  const getTransitionConfig = (path: string) => {
    if (path.startsWith('/notrom')) {
      return {
        initial: { opacity: 0, x: -20, scale: 0.98 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: 20, scale: 0.98 },
        transition: { 
          duration: 0.4, 
          ease: [0.4, 0.0, 0.2, 1],
          layout: { duration: 0.3 }
        }
      };
    }
    
    if (path.startsWith('/work')) {
      return {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.98 },
        transition: { 
          duration: 0.4, 
          ease: [0.4, 0.0, 0.2, 1],
          layout: { duration: 0.3 }
        }
      };
    }

    // Default transition for legacy view
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    };
  };

  const config = getTransitionConfig(location);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={config.initial}
        animate={config.animate}
        exit={config.exit}
        transition={config.transition}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}