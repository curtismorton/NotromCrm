import { useLocation } from "wouter";
import { useMemo } from "react";

export type WorkspaceType = 'notrom' | 'work' | 'legacy';

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
  },
  legacy: {
    id: 'legacy',
    name: 'Legacy View',
    description: 'Traditional full-app navigation',
    path: '/',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

export function useWorkspace() {
  const [location] = useLocation();
  
  const currentWorkspace = useMemo((): Workspace => {
    if (location.startsWith('/notrom')) return workspaces.notrom;
    if (location.startsWith('/work')) return workspaces.work;
    return workspaces.legacy;
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
        return []; // No filter for legacy view
    }
  };

  return {
    currentWorkspace,
    isInWorkspace,
    getWorkspaceFilter,
    allWorkspaces: Object.values(workspaces)
  };
}