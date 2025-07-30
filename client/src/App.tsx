import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/notrom" component={NotromPage} />
      <Route path="/podcast" component={PodcastPage} />
      <Route path="/day-job" component={DayJobPage} />
      <Route path="/pipeline" component={PipelinePage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/leads/:id" component={LeadDetailsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailsPage} />
      <Route path="/clients" component={ClientsPage} />
      <Route path="/clients/:id" component={ClientDetailsPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/tasks/:id" component={TaskDetailsPage} />
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
          <Router />
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
