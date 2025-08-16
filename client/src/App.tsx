import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { WorkspaceTransition } from "@/components/ui/workspace-transition";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import DashboardPage from "@/pages/DashboardPage";
import InboxPageFixed from "@/pages/InboxPageFixed";
import CalendarPageFixed from "@/pages/CalendarPageFixed";
import TasksPageNew from "@/pages/TasksPageNew";
import NotromWorkspaceFixed from "@/pages/NotromWorkspaceFixed";
import WorkWorkspaceFixed from "@/pages/WorkWorkspaceFixed";
import NotromPage from "@/pages/NotromPage";
import PodcastPage from "@/pages/PodcastPage";
import DayJobPage from "@/pages/DayJobPage";
import PipelinePage from "@/pages/PipelinePage";
import LeadsPage from "@/pages/leads/LeadsPage";
import LeadDetailsPage from "@/pages/leads/LeadDetailsPage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailsPage from "@/pages/projects/ProjectDetailsPage";
import ClientsPage from "@/pages/clients/ClientsPage";
import ClientDetailsPage from "@/pages/clients/ClientDetailsPage";
import TasksPage from "@/pages/tasks/TasksPage";
import TaskDetailsPage from "@/pages/tasks/TaskDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import ExportPage from "@/pages/ExportPage";

function Router() {
  return (
    <Switch>
      {/* Root defaults to new dashboard */}
      <Route path="/" component={DashboardPage} />
      
      {/* Workspace routes */}
      <Route path="/notrom" component={NotromWorkspaceFixed} />
      <Route path="/notrom/:page*" component={NotromWorkspaceFixed} />
      <Route path="/work" component={WorkWorkspaceFixed} />
      <Route path="/work/:page*" component={WorkWorkspaceFixed} />
      
      {/* Legacy routes now redirect through workspaces */}
      <Route path="/leads" component={() => <NotromWorkspaceFixed />} />
      <Route path="/leads/:id" component={() => <NotromWorkspaceFixed />} />
      <Route path="/projects" component={() => <NotromWorkspaceFixed />} />
      <Route path="/projects/:id" component={() => <NotromWorkspaceFixed />} />
      <Route path="/clients" component={() => <NotromWorkspaceFixed />} />
      <Route path="/clients/:id" component={() => <NotromWorkspaceFixed />} />
      <Route path="/tasks" component={TasksPageNew} />
      <Route path="/inbox" component={InboxPageFixed} />
      <Route path="/calendar" component={CalendarPageFixed} />
      <Route path="/demo-dashboard" component={DashboardPage} />
      <Route path="/demo-tasks" component={TasksPageNew} />
      
      {/* Legacy workspace routes for backward compatibility */}
      <Route path="/work-old" component={() => <WorkWorkspace />} />
      <Route path="/tasks/:id" component={() => <WorkWorkspace />} />
      <Route path="/pipeline" component={() => <NotromWorkspace />} />
      <Route path="/podcast" component={() => <WorkWorkspace />} />
      <Route path="/day-job" component={() => <WorkWorkspace />} />
      <Route path="/dayjob" component={() => <WorkWorkspace />} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/export" component={ExportPage} />
      <Route path="/analytics" component={() => <WorkWorkspace />} />
      <Route path="/tasks/templates" component={() => <WorkWorkspace />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainLayout>
          <WorkspaceTransition>
            <Router />
          </WorkspaceTransition>
          <FloatingActionButton />
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
