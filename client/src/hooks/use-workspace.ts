import { useLocation } from "wouter";
import { useMemo, useEffect } from "react";

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

export function useWorkspace() {
  const [location] = useLocation();
  
  const currentWorkspace = useMemo((): Workspace => {
    console.log('useWorkspace - Current location:', location);
    
    // Always check for explicit notrom workspace first
    if (location.startsWith('/notrom')) {
      console.log('useWorkspace - Detected notrom workspace');
      // Store workspace preference 
      sessionStorage.setItem('lastWorkspace', 'notrom');
      return workspaces.notrom;
    }
    
    // For business-focused pages, check if we should preserve notrom context
    const businessPaths = ['/leads', '/projects', '/clients', '/pipeline'];
    if (businessPaths.some(path => location.startsWith(path))) {
      const lastWorkspace = sessionStorage.getItem('lastWorkspace');
      if (lastWorkspace === 'notrom') {
        console.log('useWorkspace - Preserving notrom workspace for business page');
        return workspaces.notrom;
      }
    }
    
    // Clear workspace preference for non-business pages
    if (location !== '/' && !businessPaths.some(path => location.startsWith(path))) {
      sessionStorage.setItem('lastWorkspace', 'work');
    }
    
    console.log('useWorkspace - Detected work workspace (default)');
    return workspaces.work;
  }, [location]);

  const isInWorkspace = (workspaceId: WorkspaceType): boolean => {
    return currentWorkspace.id === workspaceId;
  };

  const getWorkspaceFilter = () => {
    switch (currentWorkspace.id) {
      case 'notrom':
        return ['notrom'];
      case 'work':
        return ['podcast', 'day_job', 'general', 'personal', 'work_personal'];
      default:
        return ['podcast', 'day_job', 'general', 'personal', 'work_personal'];
    }
  };

  return {
    currentWorkspace,
    isInWorkspace,
    getWorkspaceFilter,
    allWorkspaces: Object.values(workspaces)
  };
}