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
import NotromWorkspace from "@/pages/NotromWorkspace";
import WorkWorkspace from "@/pages/WorkWorkspace";
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
      {/* Root defaults to work workspace but checks session storage */}
      <Route path="/" component={() => {
        const lastWorkspace = sessionStorage.getItem('lastWorkspace');
        if (lastWorkspace === 'notrom') {
          return <NotromWorkspace />;
        }
        return <WorkWorkspace />;
      }} />
      
      {/* Workspace routes */}
      <Route path="/notrom" component={NotromWorkspace} />
      <Route path="/notrom/:page*" component={NotromWorkspace} />
      <Route path="/work" component={WorkWorkspace} />
      <Route path="/work/:page*" component={WorkWorkspace} />
      
      {/* Legacy routes now redirect through workspaces */}
      <Route path="/leads" component={() => <NotromWorkspace />} />
      <Route path="/leads/:id" component={() => <NotromWorkspace />} />
      <Route path="/projects" component={() => <NotromWorkspace />} />
      <Route path="/projects/:id" component={() => <NotromWorkspace />} />
      <Route path="/clients" component={() => <NotromWorkspace />} />
      <Route path="/clients/:id" component={() => <NotromWorkspace />} />
      <Route path="/tasks" component={() => <WorkWorkspace />} />
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
