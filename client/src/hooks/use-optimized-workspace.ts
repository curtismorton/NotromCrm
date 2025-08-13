import { useLocation } from "wouter";
import { useMemo, useEffect, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

export type WorkspaceType = 'notrom' | 'work';

export interface Workspace {
  id: WorkspaceType;
  name: string;
  description: string;
  path: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const workspaces: Record<WorkspaceType, Workspace> = {
  notrom: {
    id: 'notrom',
    name: 'Notrom Business',
    description: 'Web development business & client management',
    path: '/notrom',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  work: {
    id: 'work',
    name: 'Day-to-Day Work', 
    description: 'Personal tasks, podcast & career management',
    path: '/work',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
};

// Cache workspace data for performance
const workspaceCache = {
  lastWorkspace: null as WorkspaceType | null,
  lastLocation: '',
  computedWorkspace: null as Workspace | null,
};

export function useOptimizedWorkspace() {
  const [location] = useLocation();
  
  const currentWorkspace = useMemo((): Workspace => {
    // Use cache if location hasn't changed
    if (workspaceCache.lastLocation === location && workspaceCache.computedWorkspace) {
      return workspaceCache.computedWorkspace;
    }
    
    // Always check for explicit notrom workspace first
    if (location.startsWith('/notrom')) {
      const workspace = workspaces.notrom;
      sessionStorage.setItem('lastWorkspace', 'notrom');
      workspaceCache.lastWorkspace = 'notrom';
      workspaceCache.lastLocation = location;
      workspaceCache.computedWorkspace = workspace;
      return workspace;
    }
    
    // Always check for explicit work workspace
    if (location.startsWith('/work')) {
      const workspace = workspaces.work;
      sessionStorage.setItem('lastWorkspace', 'work');
      workspaceCache.lastWorkspace = 'work';
      workspaceCache.lastLocation = location;
      workspaceCache.computedWorkspace = workspace;
      return workspace;
    }
    
    // For business-focused pages, check if we should preserve notrom context
    const businessPaths = ['/leads', '/projects', '/clients', '/pipeline'];
    if (businessPaths.some(path => location.startsWith(path))) {
      const lastWorkspace = workspaceCache.lastWorkspace || sessionStorage.getItem('lastWorkspace');
      if (lastWorkspace === 'notrom') {
        const workspace = workspaces.notrom;
        workspaceCache.lastLocation = location;
        workspaceCache.computedWorkspace = workspace;
        return workspace;
      }
    }
    
    // For home path ('/'), check last workspace preference
    if (location === '/') {
      const lastWorkspace = workspaceCache.lastWorkspace || sessionStorage.getItem('lastWorkspace');
      if (lastWorkspace === 'notrom') {
        const workspace = workspaces.notrom;
        workspaceCache.lastLocation = location;
        workspaceCache.computedWorkspace = workspace;
        return workspace;
      }
    }
    
    const workspace = workspaces.work;
    workspaceCache.lastWorkspace = 'work';
    workspaceCache.lastLocation = location;
    workspaceCache.computedWorkspace = workspace;
    return workspace;
  }, [location]);

  // Preload critical data for both workspaces
  const preloadWorkspaceData = useCallback(async () => {
    const criticalQueries = [
      '/api/dashboard/stats',
      '/api/leads',
      '/api/projects',
      '/api/tasks',
      '/api/clients'
    ];

    // Prefetch queries that haven't been loaded recently
    criticalQueries.forEach(queryKey => {
      const data = queryClient.getQueryData([queryKey]);
      const state = queryClient.getQueryState([queryKey]);
      
      // If data is stale or missing, prefetch it
      if (!data || (state && Date.now() - state.dataUpdatedAt > 30000)) {
        queryClient.prefetchQuery({
          queryKey: [queryKey],
          staleTime: 30000, // Consider data fresh for 30 seconds
        });
      }
    });
  }, []);

  // Optimize workspace switching
  const switchWorkspace = useCallback(async (targetWorkspace: WorkspaceType) => {
    // Pre-warm cache for target workspace
    await preloadWorkspaceData();
    
    // Update cache immediately
    workspaceCache.lastWorkspace = targetWorkspace;
    sessionStorage.setItem('lastWorkspace', targetWorkspace);
    
    return targetWorkspace;
  }, [preloadWorkspaceData]);

  // Preload data on workspace change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      preloadWorkspaceData();
    }, 100); // Small delay to avoid blocking initial render

    return () => clearTimeout(timeoutId);
  }, [currentWorkspace.id, preloadWorkspaceData]);

  const isInWorkspace = useCallback((workspaceId: WorkspaceType): boolean => {
    return currentWorkspace.id === workspaceId;
  }, [currentWorkspace.id]);

  const getWorkspaceFilter = useCallback(() => {
    switch (currentWorkspace.id) {
      case 'notrom':
        return ['notrom'];
      case 'work':
        return ['podcast', 'day_job', 'general', 'personal', 'work_personal'];
      default:
        return ['podcast', 'day_job', 'general', 'personal', 'work_personal'];
    }
  }, [currentWorkspace.id]);

  return {
    currentWorkspace,
    isInWorkspace,
    getWorkspaceFilter,
    switchWorkspace,
    preloadWorkspaceData,
    allWorkspaces: Object.values(workspaces)
  };
}