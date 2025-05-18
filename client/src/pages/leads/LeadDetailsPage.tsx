import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { LeadForm } from "@/components/modules/leads/LeadForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Lead } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  
  const { data: lead, isLoading } = useQuery<Lead>({
    queryKey: [`/api/leads/${id}`],
    enabled: !isNew && !!id,
  });

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/leads">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Leads
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isNew ? "Create New Lead" : isLoading ? "Loading..." : `Lead: ${lead?.companyName}`}
          </h1>
        </div>
      </div>

      {isNew ? (
        <LeadForm />
      ) : (
        <>
          {lead && (
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lead Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="divide-y divide-gray-100">
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Company Name</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{lead.companyName}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Website</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {lead.website ? (
                              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                {lead.website}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Industry</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {lead.industry || <span className="text-gray-400">Not specified</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Status</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            <Badge variant="outline" className={cn("status-badge-" + lead.status)}>
                              {lead.status.replace(/_/g, " ")}
                            </Badge>
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Priority</dt>
                          <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                            <Badge variant="outline" className={cn("priority-badge-" + lead.priority)}>
                              {lead.priority}
                            </Badge>
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Source</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {lead.source || <span className="text-gray-400">Not specified</span>}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Created</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {format(new Date(lead.createdAt), "PPP")}
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
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{lead.contactName}</dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Email</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {lead.contactEmail ? (
                              <a href={`mailto:${lead.contactEmail}`} className="text-primary-600 hover:underline">
                                {lead.contactEmail}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </dd>
                        </div>
                        <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                          <dt className="text-sm font-medium leading-6 text-gray-900">Phone</dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {lead.contactPhone ? (
                              <a href={`tel:${lead.contactPhone}`} className="text-primary-600 hover:underline">
                                {lead.contactPhone}
                              </a>
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
                      {lead.notes ? (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-400">No notes have been added yet.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button asChild>
                    <Link href={`/projects/new?leadId=${lead.id}`}>
                      Create Project
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/clients/new?leadId=${lead.id}`}>
                      Convert to Client
                    </Link>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <LeadForm lead={lead} isEdit={true} />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
