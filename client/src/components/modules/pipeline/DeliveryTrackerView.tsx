import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Delivery } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeliveryForm } from "@/components/modules/delivery/DeliveryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  template_assigned: "bg-blue-100 text-blue-800",
  copy_prompt_generated: "bg-purple-100 text-purple-800",
  build_started: "bg-yellow-100 text-yellow-800",
  build_completed: "bg-orange-100 text-orange-800",
  client_review: "bg-indigo-100 text-indigo-800",
  revision_requested: "bg-red-100 text-red-800",
  final_approved: "bg-green-100 text-green-800",
  hosting_setup: "bg-cyan-100 text-cyan-800",
  completed: "bg-emerald-100 text-emerald-800",
};

export function DeliveryTrackerView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingDelivery, setIsAddingDelivery] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  const { data: deliveries = [], isLoading } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  const deleteDeliveryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/deliveries/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: "Delivery deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete delivery",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading deliveries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Delivery Tracker</h3>
          <p className="text-sm text-muted-foreground">
            Track every website build through its development lifecycle
          </p>
        </div>
        <Dialog open={isAddingDelivery} onOpenChange={setIsAddingDelivery}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Delivery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Delivery</DialogTitle>
            </DialogHeader>
            <DeliveryForm 
              onSuccess={() => {
                setIsAddingDelivery(false);
                queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Build Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No deliveries found. Create your first delivery to get started.
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{delivery.clientName}</div>
                        {delivery.buildUrl && (
                          <a 
                            href={delivery.buildUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Build <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {delivery.businessType && (
                        <Badge variant="outline">
                          {delivery.businessType.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {delivery.assignedTemplate && (
                          <div className="text-sm">{delivery.assignedTemplate}</div>
                        )}
                        {delivery.templateUrl && (
                          <a 
                            href={delivery.templateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View Template <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[delivery.status] || statusColors.template_assigned}>
                        {delivery.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {delivery.copyPromptGenerated ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs">Copy Prompt</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {delivery.buildStarted ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs">Build Started</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {delivery.revisionRoundUsed ? (
                            <CheckCircle2 className="w-3 h-3 text-orange-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs">Revision Used</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {delivery.hostingPlan ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs">Hosting Plan</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {delivery.deliveryDate ? (
                        <div className="text-sm">
                          {format(new Date(delivery.deliveryDate), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not set</span>
                      )}
                      {delivery.finalReviewDate && (
                        <div className="text-xs text-muted-foreground">
                          Reviewed: {format(new Date(delivery.finalReviewDate), 'MMM dd')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDelivery(delivery)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDeliveryMutation.mutate(delivery.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Delivery Dialog */}
      <Dialog open={!!editingDelivery} onOpenChange={() => setEditingDelivery(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Delivery</DialogTitle>
          </DialogHeader>
          {editingDelivery && (
            <DeliveryForm 
              delivery={editingDelivery}
              onSuccess={() => {
                setEditingDelivery(null);
                queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}