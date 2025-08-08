import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Briefcase } from "lucide-react";
import { Lead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { LeadForm } from "@/components/modules/leads/LeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusColumns = [
  { 
    id: "lead_identified", 
    title: "Lead Identified", 
    color: "bg-blue-100 text-blue-800",
    icon: "🎯",
    description: "New prospects identified"
  },
  { 
    id: "contacted", 
    title: "Contacted", 
    color: "bg-yellow-100 text-yellow-800",
    icon: "📞",
    description: "Initial outreach sent"
  },
  { 
    id: "call_booked", 
    title: "Call Booked", 
    color: "bg-orange-100 text-orange-800",
    icon: "📅",
    description: "Discovery call scheduled"
  },
  { 
    id: "onboarding_form_completed", 
    title: "Onboarding Complete", 
    color: "bg-purple-100 text-purple-800",
    icon: "📋",
    description: "Forms received, ready to start"
  },
  { 
    id: "build_in_progress", 
    title: "Build in Progress", 
    color: "bg-indigo-100 text-indigo-800",
    icon: "🔨",
    description: "Development underway"
  },
  { 
    id: "awaiting_feedback", 
    title: "Awaiting Feedback", 
    color: "bg-pink-100 text-pink-800",
    icon: "⌛",
    description: "Waiting for client review"
  },
  { 
    id: "revision_round", 
    title: "Revision Round", 
    color: "bg-red-100 text-red-800",
    icon: "🔄",
    description: "Making requested changes"
  },
  { 
    id: "final_delivery", 
    title: "Final Delivery", 
    color: "bg-green-100 text-green-800",
    icon: "📦",
    description: "Project completed, delivering"
  },
  { 
    id: "hosting_setup", 
    title: "Hosting Setup", 
    color: "bg-cyan-100 text-cyan-800",
    icon: "🌐",
    description: "Setting up live environment"
  },
  { 
    id: "complete", 
    title: "Complete", 
    color: "bg-emerald-100 text-emerald-800",
    icon: "✅",
    description: "Project successfully delivered"
  },
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
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
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

    // Extract context and lead ID from draggableId (format: "context-leadId")
    const [context, leadIdStr] = result.draggableId.split('-');
    const leadId = parseInt(leadIdStr);
    
    // Extract context and status from droppableId (format: "context-status")
    const [, newStatus] = result.destination.droppableId.split('-');

    updateLeadMutation.mutate({ leadId, status: newStatus });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading pipeline...</div>;
  }

  // Filter leads by context
  const { notromLeads, dayJobLeads, notromLeadCount, dayJobLeadCount } = useMemo(() => {
    const notrom = leads.filter(lead => lead.context === 'notrom');
    const dayJob = leads.filter(lead => lead.context === 'day_job');
    console.count('LeadPipelineKanban filtering');
    return {
      notromLeads: notrom,
      dayJobLeads: dayJob,
      notromLeadCount: notrom.length,
      dayJobLeadCount: dayJob.length,
    };
  }, [leads]);

  const renderKanbanBoard = (contextLeads: Lead[], context: 'notrom' | 'day_job') => (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 min-h-[400px]">
        {statusColumns.map((column) => {
          const columnLeads = contextLeads.filter((lead) => lead.status === column.id);
          
          return (
            <div key={`${context}-${column.id}`} className="flex-shrink-0 w-72 sm:w-80">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{column.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium truncate">{column.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{column.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                      {columnLeads.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <Droppable droppableId={`${context}-${column.id}`}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3 min-h-[200px]"
                      >
                        {columnLeads.map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={`${context}-${lead.id}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
                                  context === 'notrom' 
                                    ? 'bg-blue-50 border-l-blue-500' 
                                    : 'bg-green-50 border-l-green-500'
                                } ${snapshot.isDragging ? 'shadow-lg scale-105' : ''}`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm truncate flex-1">{lead.companyName}</h4>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span className="text-xs">
                                        {context === 'notrom' ? '🏢' : '💼'}
                                      </span>
                                      {lead.businessType && (
                                        <Badge variant="outline" className="text-xs">
                                          {lead.businessType}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{lead.contactName}</p>
                                  {lead.contactEmail && (
                                    <p className="text-xs text-muted-foreground truncate">{lead.contactEmail}</p>
                                  )}
                                  {lead.deadline && (
                                    <p className="text-xs text-orange-600 flex items-center gap-1">
                                      <span>⏰</span>
                                      Due: {new Date(lead.deadline).toLocaleDateString()}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <Badge className={`text-xs ${
                                      lead.priority === 'high' ? 'bg-red-100 text-red-800' :
                                      lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {lead.priority === 'high' && '🔥'} 
                                      {lead.priority === 'medium' && '⚡'} 
                                      {lead.priority === 'low' && '📝'} 
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
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>🚀</span> Lead Pipeline
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag cards between columns to update status. Switch between business contexts below.
          </p>
        </div>
        <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
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

      {/* Context-based Pipeline Tabs */}
      <Tabs defaultValue="notrom" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notrom" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Notrom Business</span>
            <span className="sm:hidden">Notrom</span>
            <Badge variant="secondary" className="ml-2">
              {notromLeadCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="day_job" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Day Job</span>
            <span className="sm:hidden">Day Job</span>
            <Badge variant="secondary" className="ml-2">
              {dayJobLeadCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notrom" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Notrom Business Pipeline</h4>
                <p className="text-sm text-blue-700">
                  Web development side hustle - client websites, e-commerce, and digital solutions
                </p>
              </div>
            </div>
          </div>
          {renderKanbanBoard(notromLeads, 'notrom')}
        </TabsContent>

        <TabsContent value="day_job" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Day Job Pipeline</h4>
                <p className="text-sm text-green-700">
                  Head of Talent Management at Socially Powerful - recruitment and HR projects
                </p>
              </div>
            </div>
          </div>
          {renderKanbanBoard(dayJobLeads, 'day_job')}
        </TabsContent>
      </Tabs>
    </div>
  );
}