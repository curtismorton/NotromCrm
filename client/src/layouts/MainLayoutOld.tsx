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
  Home,
  Inbox,
  TrendingUp,
  FileText,
  Calendar,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useMedia } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
// Removed workspace-specific imports

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
      <div className="flex items-center justify-center">
        <HomeLogoButton />
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
      {/* Main Navigation */}
      <div className="space-y-2">
        <div className="space-y-1">
          <SidebarItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            href="/"
            active={location === "/"}
          />
          <SidebarItem
            icon={<Inbox className="w-5 h-5" />}
            label="Inbox"
            href="/inbox"
            active={location.startsWith("/inbox")}
          />
          <SidebarItem
            icon={<CheckSquare className="w-5 h-5" />}
            label="Tasks"
            href="/tasks"
            badgeCount={stats?.totalTasks}
            active={location.startsWith("/tasks")}
          />
        </div>
      </div>

      {/* Business Operations */}
      <div className="space-y-2">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</h3>
        <div className="space-y-1">
          <SidebarItem
            icon={<Users className="w-5 h-5" />}
            label="Leads"
            href="/leads"
            badgeCount={stats?.totalLeads}
            active={location.startsWith("/leads")}
          />
          <SidebarItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="Deals"
            href="/deals"
            active={location.startsWith("/deals")}
          />
          <SidebarItem
            icon={<FolderKanban className="w-5 h-5" />}
            label="Projects"
            href="/projects"
            badgeCount={stats?.activeProjects}
            active={location.startsWith("/projects")}
          />
          <SidebarItem
            icon={<Building2 className="w-5 h-5" />}
            label="Clients"
            href="/clients"
            badgeCount={stats?.totalClients}
            active={location.startsWith("/clients")}
          />
        </div>
      </div>

      {/* Content & Schedule */}
      <div className="space-y-2">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content & Schedule</h3>
        <div className="space-y-1">
          <SidebarItem
            icon={<FileText className="w-5 h-5" />}
            label="Content"
            href="/content"
            active={location.startsWith("/content")}
          />
          <SidebarItem
            icon={<Calendar className="w-5 h-5" />}
            label="Calendar"
            href="/calendar"
            active={location.startsWith("/calendar")}
          />
        </div>
      </div>

      {/* Reports & Settings */}
      <div className="space-y-2">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</h3>
        <div className="space-y-1">
          <SidebarItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Reports"
            href="/reports"
            active={location.startsWith("/reports")}
          />
        </div>
      </div>





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

// Simple Home Logo Button
function HomeLogoButton() {
  const [location, navigate] = useLocation();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🏠 Logo clicked - navigating to dashboard');
    navigate('/');
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
        {/* Mobile Header */}
        {isMobile && (
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                CurtisOS
              </h1>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}