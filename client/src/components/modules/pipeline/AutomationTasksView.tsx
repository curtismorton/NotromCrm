import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Play, Pause } from "lucide-react";
import { Automation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AutomationForm } from "@/components/modules/automation/AutomationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  planned: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  built: "bg-green-100 text-green-800",
  testing: "bg-yellow-100 text-yellow-800",
  deployed: "bg-emerald-100 text-emerald-800",
};

const toolColors: Record<string, string> = {
  zapier: "bg-orange-100 text-orange-800",
  make: "bg-purple-100 text-purple-800",
  python: "bg-blue-100 text-blue-800",
  javascript: "bg-yellow-100 text-yellow-800",
  webhooks: "bg-indigo-100 text-indigo-800",
  email: "bg-red-100 text-red-800",
  notion: "bg-gray-100 text-gray-800",
  other: "bg-gray-100 text-gray-800",
};

export function AutomationTasksView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingAutomation, setIsAddingAutomation] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const { data: automations = [], isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/automations"],
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/automations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({
        title: "Success",
        description: "Automation deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/automations/${id}`, {
        method: "PATCH",
        body: { isActive },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update automation",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading automations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Task Automations</h3>
          <p className="text-sm text-muted-foreground">
            Manage automated workflows and integrations
          </p>
        </div>
        <Dialog open={isAddingAutomation} onOpenChange={setIsAddingAutomation}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Automation</DialogTitle>
            </DialogHeader>
            <AutomationForm 
              onSuccess={() => {
                setIsAddingAutomation(false);
                queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No automations found. Create your first automation to get started.
                  </TableCell>
                </TableRow>
              ) : (
                automations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{automation.name}</div>
                        {automation.description && (
                          <div className="text-sm text-muted-foreground">
                            {automation.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {automation.trigger.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={toolColors[automation.tool] || toolColors.other}>
                        {automation.tool}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[automation.status] || statusColors.planned}>
                        {automation.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={automation.priority === 'high' ? 'destructive' : 
                                automation.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {automation.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAutomationMutation.mutate({
                          id: automation.id,
                          isActive: !automation.isActive
                        })}
                      >
                        {automation.isActive ? (
                          <Pause className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Play className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAutomation(automation)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAutomationMutation.mutate(automation.id)}
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

      {/* Edit Automation Dialog */}
      <Dialog open={!!editingAutomation} onOpenChange={() => setEditingAutomation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Automation</DialogTitle>
          </DialogHeader>
          {editingAutomation && (
            <AutomationForm 
              automation={editingAutomation}
              onSuccess={() => {
                setEditingAutomation(null);
                queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}