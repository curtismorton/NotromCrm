import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Lead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LeadForm } from "@/components/modules/leads/LeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusColumns = [
  { id: "lead_identified", title: "Lead Identified", color: "bg-blue-100 text-blue-800" },
  { id: "contacted", title: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { id: "call_booked", title: "Call Booked", color: "bg-orange-100 text-orange-800" },
  { id: "onboarding_form_completed", title: "Onboarding Complete", color: "bg-purple-100 text-purple-800" },
  { id: "build_in_progress", title: "Build in Progress", color: "bg-indigo-100 text-indigo-800" },
  { id: "awaiting_feedback", title: "Awaiting Feedback", color: "bg-pink-100 text-pink-800" },
  { id: "revision_round", title: "Revision Round", color: "bg-red-100 text-red-800" },
  { id: "final_delivery", title: "Final Delivery", color: "bg-green-100 text-green-800" },
  { id: "hosting_setup", title: "Hosting Setup", color: "bg-cyan-100 text-cyan-800" },
  { id: "complete", title: "Complete", color: "bg-emerald-100 text-emerald-800" },
];

export function LeadPipelineKanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingLead, setIsAddingLead] = useState(false);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: number; status: string }) => {
      return apiRequest(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/pipeline-stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const leadId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;

    updateLeadMutation.mutate({ leadId, status: newStatus });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lead Pipeline</h3>
        <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <LeadForm 
              onSuccess={() => {
                setIsAddingLead(false);
                queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => {
            const columnLeads = leads.filter((lead) => lead.status === column.id);
            
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {columnLeads.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId={column.id}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-3 min-h-[200px]"
                        >
                          {columnLeads.map((lead, index) => (
                            <Draggable
                              key={lead.id}
                              draggableId={lead.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm">{lead.companyName}</h4>
                                      {lead.businessType && (
                                        <Badge variant="outline" className="text-xs">
                                          {lead.businessType}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                                    {lead.contactEmail && (
                                      <p className="text-xs text-muted-foreground">{lead.contactEmail}</p>
                                    )}
                                    {lead.deadline && (
                                      <p className="text-xs text-orange-600">
                                        Due: {new Date(lead.deadline).toLocaleDateString()}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <Badge className={column.color}>
                                        {lead.priority}
                                      </Badge>
                                      {lead.onboardingFormReceived && (
                                        <Badge variant="secondary" className="text-xs">
                                          Form ✓
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}