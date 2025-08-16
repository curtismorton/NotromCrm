import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Inbox, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Mic,
  Briefcase
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  drawer?: ReactNode;
}

export function AppShell({ children, drawer }: AppShellProps) {
  const [location] = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox', href: '/inbox', icon: Inbox },
    { id: 'tasks', label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', href: '/projects', icon: FolderOpen },
    { id: 'clients', label: 'Clients', href: '/clients', icon: Users },
    { id: 'leads', label: 'Leads', href: '/leads', icon: Target },
    { id: 'calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const contextItems = [
    { id: 'notrom', label: 'Notrom Business', href: '/notrom', icon: FileText },
    { id: 'podcast', label: 'Podcast', href: '/podcast', icon: Mic },
    { id: 'day-job', label: 'Day Job', href: '/day-job', icon: Briefcase },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <div className="app-shell bg-scene noise">
      {/* Navigation */}
      <nav className="app-shell__nav">
        <div className="p-16 mb-16">
          <h1 className="text-h3 mb-0">CurtisOS</h1>
          <p className="text-meta mb-0">Unified Life & Work</p>
        </div>

        {/* Main navigation */}
        <div className="mb-24">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href} className="nav">
                <div className={`nav__item ${isActive(item.href) ? 'nav__item--active' : ''}`}>
                  <Icon className="nav__icon" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Context navigation */}
        <div className="px-16 mb-12">
          <h3 className="text-meta mb-8">CONTEXTS</h3>
        </div>
        <div className="mb-24">
          {contextItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href} className="nav">
                <div className={`nav__item ${isActive(item.href) ? 'nav__item--active' : ''}`}>
                  <Icon className="nav__icon" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Settings */}
        <div className="mt-auto p-16">
          <Link href="/settings" className="nav">
            <div className={`nav__item ${isActive('/settings') ? 'nav__item--active' : ''}`}>
              <Settings className="nav__icon" />
              <span>Settings</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header className="app-shell__header">
        <div className="flex items-center gap-16 flex-1">
          <div className="flex items-center gap-12">
            <input
              type="text"
              placeholder="Search and Command"
              className="input"
              style={{ width: '300px' }}
            />
            <div className="badge">
              <span>⌘K</span>
            </div>
          </div>
          
          <div className="ml-auto">
            <button className="btn btn--primary btn--small">
              Quick Add
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-shell__main">
        {children}
      </main>

      {/* Right drawer */}
      {drawer && (
        <aside className="app-shell__drawer">
          {drawer}
        </aside>
      )}
    </div>
  );
}