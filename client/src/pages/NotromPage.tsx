import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Users, FolderKanban, Building2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Lead, Project, Client } from "@shared/schema";

export default function NotromPage() {
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Filter for Notrom-related items (you might want to add tagging later)
  const notromLeads = leads?.filter(lead => 
    lead.notes?.toLowerCase().includes('notrom') || 
    lead.source?.toLowerCase().includes('notrom')
  ) || [];

  const notromProjects = projects?.filter(project => 
    project.description?.toLowerCase().includes('notrom') ||
    project.name?.toLowerCase().includes('web') ||
    project.name?.toLowerCase().includes('website')
  ) || [];

  const notromClients = clients || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code className="w-8 h-8" />
            Notrom
          </h1>
          <p className="text-muted-foreground">Side hustle web development business</p>
        </div>
        <div className="flex gap-2">
          <Link href="/leads">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notromLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              Potential web development clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notromProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active web development projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notromClients.length}</div>
            <p className="text-xs text-muted-foreground">
              Happy clients served
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notromLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{lead.companyName}</p>
                    <p className="text-sm text-muted-foreground">{lead.contactName}</p>
                  </div>
                  <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                    {lead.status}
                  </Badge>
                </div>
              ))}
              {notromLeads.length === 0 && (
                <p className="text-sm text-muted-foreground">No leads yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notromProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.deadline && `Due: ${new Date(project.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              ))}
              {notromProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">No active projects</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}