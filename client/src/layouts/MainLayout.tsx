import { useState, ReactNode, memo } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Building2, 
  CheckSquare, 
  Settings, 
  Download, 
  Menu, 
  Mic,
  Briefcase,
  Workflow,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useMedia } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { WorkspaceSwitcher } from "@/components/ui/workspace-switcher";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { useOptimizedWorkspace } from "@/hooks/use-optimized-workspace";

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  href: string;
  badgeCount?: number;
  active?: boolean;
};

const SidebarItem = ({ icon, label, href, badgeCount, active }: SidebarItemProps) => {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center px-3 py-2.5 text-sm transition-all duration-200 rounded-lg cursor-pointer group relative",
        active 
          ? "bg-blue-50 text-blue-700 border border-blue-200 font-medium shadow-sm" 
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-normal"
      )}>
        <span className={cn(
          "w-5 h-5 transition-colors mr-3",
          active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
        )}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
          <Badge 
            variant={active ? "default" : "secondary"} 
            className={cn(
              "ml-auto text-xs font-medium",
              active ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600"
            )}
          >
            {badgeCount}
          </Badge>
        )}
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
        )}
      </div>
    </Link>
  );
};

interface DashboardStats {
  totalLeads: number;
  activeProjects: number;
  totalClients: number;
  totalTasks: number;
}

interface SidebarContentProps {
  location: string;
  stats?: DashboardStats;
}

const SidebarContent = memo(({ location, stats }: SidebarContentProps) => {
  console.log('SidebarContent render with location:', location);
  
  return (
  <div className="flex flex-col h-full bg-white border-r border-gray-200">
    {/* Logo Header */}
    <div className="flex flex-col p-4 border-b border-gray-200">
      <div className="flex items-center justify-center mb-3">
        <HomeLogoButton />
      </div>
      <WorkspaceSwitcher />
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
      {/* Main Navigation - Now Context Aware */}
      {location.startsWith("/notrom") ? (
        // Notrom Business Navigation
        <>
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Dashboard</h3>
            <div className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                href="/notrom"
                active={location === "/notrom"}
              />
              <SidebarItem
                icon={<Workflow className="w-5 h-5" />}
                label="Pipeline"
                href="/notrom/pipeline"
                active={location.startsWith("/notrom/pipeline")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Operations</h3>
            <div className="space-y-1">
              <SidebarItem
                icon={<Users className="w-5 h-5" />}
                label="Leads"
                href="/notrom/leads"
                badgeCount={stats?.totalLeads}
                active={location.startsWith("/notrom/leads")}
              />
              <SidebarItem
                icon={<FolderKanban className="w-5 h-5" />}
                label="Projects"
                href="/notrom/projects"
                badgeCount={stats?.activeProjects}
                active={location.startsWith("/notrom/projects")}
              />
              <SidebarItem
                icon={<Building2 className="w-5 h-5" />}
                label="Clients"
                href="/notrom/clients"
                badgeCount={stats?.totalClients}
                active={location.startsWith("/notrom/clients")}
              />
            </div>
          </div>
        </>
      ) : (
        // Work Navigation (Default for all other paths)
        <>
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Dashboard</h3>
            <div className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                href="/work"
                active={location === "/work" || location === "/"}
              />
              <SidebarItem
                icon={<CheckSquare className="w-5 h-5" />}
                label="Tasks"
                href="/work/tasks"
                badgeCount={stats?.totalTasks}
                active={location.startsWith("/work/tasks") || location.startsWith("/tasks")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Life Management</h3>
            <div className="space-y-1">
              <SidebarItem
                icon={<Mic className="w-5 h-5" />}
                label="Podcast"
                href="/work/podcast"
                active={location.startsWith("/work/podcast") || location.startsWith("/podcast")}
              />
              <SidebarItem
                icon={<Briefcase className="w-5 h-5" />}
                label="Day Job"
                href="/work/dayjob"
                active={location.startsWith("/work/dayjob") || location.startsWith("/dayjob")}
              />
            </div>
          </div>
        </>
      )}





      {/* Settings */}
      <div className="pt-4 mt-auto border-t border-gray-200 space-y-1">
        <SidebarItem
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          href="/settings"
          active={location.startsWith("/settings")}
        />
        <SidebarItem
          icon={<Download className="w-5 h-5" />}
          label="Export"
          href="/export"
          active={location.startsWith("/export")}
        />
      </div>
    </nav>
  </div>
  );
});

SidebarContent.displayName = "SidebarContent";

// Home Logo Button Component with double-click logic
function HomeLogoButton() {
  const { currentWorkspace, allWorkspaces, switchWorkspace } = useOptimizedWorkspace();
  const [location, navigate] = useLocation();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🏠 Logo clicked - Current workspace:', currentWorkspace.id, 'Current location:', location);
    
    // Define workspace home paths
    const workspaceHomes = {
      notrom: '/notrom',
      work: '/work'
    };
    
    const currentWorkspaceHome = workspaceHomes[currentWorkspace.id];
    const isAtWorkspaceHome = location === currentWorkspaceHome || 
                             (currentWorkspace.id === 'work' && location === '/');
    
    if (isAtWorkspaceHome) {
      // Second click - switch to other workspace with optimization
      const otherWorkspace = allWorkspaces.find(w => w.id !== currentWorkspace.id);
      if (otherWorkspace) {
        console.log('🔄 Logo second click - switching to:', otherWorkspace.id);
        switchWorkspace(otherWorkspace.id).then(() => {
          navigate(otherWorkspace.path);
        });
      }
    } else {
      // First click - go to current workspace home
      console.log('🏡 Logo first click - going to workspace home:', currentWorkspaceHome);
      navigate(currentWorkspaceHome);
    }
  };

  return (
    <button 
      onClick={handleLogoClick}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full"
      type="button"
    >
      <Home className="w-5 h-5 text-gray-600" />
      <h2 className="text-xl font-bold text-gray-900">CurtisOS</h2>
    </button>
  );
}

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useMedia("(max-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get dashboard stats for badge counts
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 flex-shrink-0">
          <SidebarContent location={location} stats={stats} />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent location={location} stats={stats} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Workspace Header - always show since all pages are now workspace-based */}
        <WorkspaceHeader />

        {/* Page Content with proper scroll container */}
        <main className="flex-1 overflow-y-auto bg-gray-50 overscroll-contain">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}