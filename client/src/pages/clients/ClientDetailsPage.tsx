import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ClientForm } from "@/components/modules/clients/ClientForm";
import { ProjectTable } from "@/components/modules/projects/ProjectTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { Client, Project } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = id === 'new';
  
  // Parse query parameters for new clients
  const queryParams = new URLSearchParams(window.location.search);
  const leadId = queryParams.get("leadId") ? parseInt(queryParams.get("leadId")!) : undefined;
  
  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: [`/api/clients/${id}`],
    enabled: !isNew && !!id,
  });
  
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects", { clientId: id }],
    enabled: !isNew && !!id,
  });

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/clients">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Clients
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? "Create New Client" : clientLoading ? "Loading..." : `Client: ${client?.companyName}`}
          </h1>
        </div>
      </div>

      {isNew ? (
        <ClientForm leadId={leadId} />
      ) : (
        <>
          {client && (
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Company Name</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{client.companyName}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Website</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client.website ? (
                              <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                {client.website}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Industry</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client.industry || <span className="text-gray-400">Not specified</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Onboarded Date</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client.onboardedDate ? format(new Date(client.onboardedDate), "PPP") : <span className="text-gray-400">Not set</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Upsell Opportunity</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            {client.upsellOpportunity ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">No</Badge>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Contact Name</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{client.contactName}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Email</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client.contactEmail ? (
                              <a href={`mailto:${client.contactEmail}`} className="text-primary-600 hover:underline">
                                {client.contactEmail}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Phone</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client.contactPhone ? (
                              <a href={`tel:${client.contactPhone}`} className="text-primary-600 hover:underline">
                                {client.contactPhone}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Address</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {client.address ? (
                              <p className="whitespace-pre-wrap">{client.address}</p>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {client.notes ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-400">No notes have been added yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <Button asChild>
                    <Link href={`/projects/new?clientId=${client.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="projects">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-semibold">Client Projects</h2>
                      <Button asChild>
                        <Link href={`/projects/new?clientId=${client.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          New Project
                        </Link>
                      </Button>
                    </div>
                    {projects && projects.length > 0 ? (
                      <ProjectTable />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">This client doesn't have any projects yet.</p>
                        <Button asChild>
                          <Link href={`/projects/new?clientId=${client.id}`}>
                            Create First Project
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <ClientForm client={client} isEdit={true} />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
