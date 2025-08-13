import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface WorkspaceTransitionProps {
  children: ReactNode;
}

// Optimize transitions for performance
const transitionVariants = {
  notrom: {
    initial: { opacity: 0, x: -10, scale: 0.99 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 10, scale: 0.99 },
    transition: { 
      duration: 0.2, // Reduced from 0.4
      ease: [0.25, 0.1, 0.25, 1], // Optimized easing
    }
  },
  work: {
    initial: { opacity: 0, y: 10, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.99 },
    transition: { 
      duration: 0.2, // Reduced from 0.4
      ease: [0.25, 0.1, 0.25, 1], // Optimized easing
    }
  }
};

export function WorkspaceTransition({ children }: WorkspaceTransitionProps) {
  const [location] = useLocation();

  // Memoize transition config for performance
  const config = useMemo(() => {
    return location.startsWith('/notrom') 
      ? transitionVariants.notrom 
      : transitionVariants.work;
  }, [location]);

  // Preload critical data during transitions
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      // Determine which workspace we're transitioning to
      const isNotromWorkspace = location.startsWith('/notrom');
      
      // Prefetch critical queries for the current workspace
      const criticalQueries = isNotromWorkspace 
        ? ['/api/leads', '/api/projects', '/api/clients', '/api/dashboard/pipeline-stats']
        : ['/api/tasks', '/api/dashboard/stats'];

      criticalQueries.forEach(queryKey => {
        const state = queryClient.getQueryState([queryKey]);
        
        // Only prefetch if data is stale or missing
        if (!state?.data || Date.now() - (state.dataUpdatedAt || 0) > 30000) {
          queryClient.prefetchQuery({
            queryKey: [queryKey],
            staleTime: 30000,
          });
        }
      });
    }, 50); // Small delay to not block main transition

    return () => clearTimeout(preloadTimer);
  }, [location]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${location}-${Date.now() % 1000}`} // Ensure unique keys for smoother transitions
        initial={config.initial}
        animate={config.animate}
        exit={config.exit}
        transition={config.transition}
        className="h-full w-full"
        style={{ willChange: 'transform, opacity' }} // Optimize for GPU
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}