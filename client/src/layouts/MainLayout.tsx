import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Building2, 
  CheckSquare, 
  Settings, 
  Download, 
  Search, 
  Bell, 
  HelpCircle, 
  Menu, 
  LogOut,
  Code,
  Mic,
  Briefcase,
  Workflow
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useMedia } from "@/hooks/use-mobile";

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
        "flex items-center px-4 py-3 text-sm transition-colors duration-200 rounded-lg cursor-pointer",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-foreground"
      )}>
        <span className="w-5 h-5">{icon}</span>
        <span className="mx-4 font-medium">{label}</span>
        {badgeCount !== undefined && (
          <Badge variant="secondary" className="ml-auto">
            {badgeCount}
          </Badge>
        )}
      </div>
    </Link>
  );
};

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isMobile = useMedia("(max-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Reset sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Get dashboard stats for badge counts
  const { data: stats } = useQuery<{
    totalLeads: number;
    activeProjects: number;
    totalClients: number;
    overdueTasks: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition-transform transform bg-sidebar-background border-r border-sidebar-border lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-16 px-6 bg-primary-600">
          <h2 className="text-xl font-semibold text-white">CurtisOS</h2>
        </div>
        <nav className="px-3 py-4">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            href="/" 
            active={location === "/"} 
          />
          
          <div className="mt-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Business</p>
            
            <SidebarItem 
              icon={<Workflow className="w-5 h-5" />} 
              label="Pipeline" 
              href="/pipeline" 
              active={location.startsWith("/pipeline")} 
            />
            
            <SidebarItem 
              icon={<Users className="w-5 h-5" />} 
              label="Leads" 
              href="/leads" 
              badgeCount={stats ? stats.totalLeads : undefined} 
              active={location.startsWith("/leads")} 
            />
            
            <SidebarItem 
              icon={<FolderKanban className="w-5 h-5" />} 
              label="Projects" 
              href="/projects" 
              badgeCount={stats ? stats.activeProjects : undefined} 
              active={location.startsWith("/projects")} 
            />
            
            <SidebarItem 
              icon={<Building2 className="w-5 h-5" />} 
              label="Clients" 
              href="/clients" 
              badgeCount={stats ? stats.totalClients : undefined} 
              active={location.startsWith("/clients")} 
            />
          </div>
          
          <div className="mt-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Life & Work</p>
            
            <SidebarItem 
              icon={<Code className="w-5 h-5" />} 
              label="Notrom" 
              href="/notrom" 
              active={location.startsWith("/notrom")} 
            />
            
            <SidebarItem 
              icon={<Mic className="w-5 h-5" />} 
              label="Podcast" 
              href="/podcast" 
              active={location.startsWith("/podcast")} 
            />
            
            <SidebarItem 
              icon={<Briefcase className="w-5 h-5" />} 
              label="Day Job" 
              href="/day-job" 
              active={location.startsWith("/day-job")} 
            />
            
            <SidebarItem 
              icon={<CheckSquare className="w-5 h-5" />} 
              label="General Tasks" 
              href="/tasks" 
              badgeCount={stats ? stats.overdueTasks : undefined} 
              active={location.startsWith("/tasks")} 
            />
          </div>
          
          <div className="mt-6 space-y-1">
            <p className="px-4 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Settings</p>
            
            <SidebarItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              href="/settings" 
              active={location === "/settings"} 
            />
            
            <SidebarItem 
              icon={<Download className="w-5 h-5" />} 
              label="Export" 
              href="/export" 
              active={location === "/export"} 
            />
          </div>
        </nav>
        <div className="absolute bottom-0 w-full">
          <div className="flex items-center px-5 py-3 border-t border-sidebar-border">
            <Avatar>
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
              <AvatarFallback>CM</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">Chris Morgan</p>
              <p className="text-xs text-sidebar-foreground/60">Administrator</p>
            </div>
            <Button variant="ghost" size="icon" className="p-1 ml-auto text-sidebar-foreground/80 hover:text-sidebar-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile navigation backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-20 transition-opacity bg-gray-600 opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Top navbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b lg:py-4 lg:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 mr-3 text-gray-500 lg:hidden focus:ring-primary-500"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-gray-700 bg-gray-100 border-none rounded-lg"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="p-1 mr-4 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <Bell className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="p-1 mr-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View help</span>
              <HelpCircle className="w-6 h-6" />
            </Button>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
