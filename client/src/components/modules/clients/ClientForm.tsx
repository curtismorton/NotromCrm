import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Client, insertClientSchema, Lead } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api, apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { logger } from "../../../../../server/utils/logger";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const formSchema = insertClientSchema.extend({
  onboardedDate: z.string().optional(),
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  client?: Client;
  isEdit?: boolean;
  leadId?: number;
}

export const ClientForm = ({ client, isEdit = false, leadId }: ClientFormProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get lead data if provided for pre-filling
  const { data: lead } = useQuery<Lead>({
    queryKey: [`/api/leads/${leadId}`],
    enabled: !!leadId,
  });
  
  // Format dates for form
  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd");
  };
  
  const defaultValues: Partial<ClientFormValues> = {
    companyName: client?.companyName || lead?.companyName || "",
    website: client?.website || lead?.website || "",
    industry: client?.industry || "",
    contactName: client?.contactName || lead?.contactName || "",
    contactEmail: client?.contactEmail || lead?.contactEmail || "",
    contactPhone: client?.contactPhone || lead?.contactPhone || "",
    address: client?.address || "",
    notes: client?.notes || lead?.notes || "",
    onboardedDate: formatDateForInput(client?.onboardedDate),
    upsellOpportunity: client?.upsellOpportunity || false,
  };

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createClientMutation = useMutation({
    mutationFn: (data: ClientFormValues) => {
      // Convert date strings to ISO format for the API
      const formattedData = {
        ...data,
        onboardedDate: data.onboardedDate ? new Date(data.onboardedDate).toISOString() : undefined,
      };
      return api.post("/api/clients", formattedData);
    },
    onSuccess: async (response) => {
      toast({
        title: "Client created",
        description: "Client has been created successfully",
      });
      
      // If this was created from a lead, create a project linking them
      if (leadId && response.id) {
        try {
          await apiRequest("POST", "/api/projects", {
            name: `${response.companyName} Website`,
            status: "planning",
            leadId: leadId,
            clientId: response.id,
          });
          
          // Record activity for converting lead to client
          await apiRequest("POST", "/api/activities", {
            action: "convert",
            entityType: "lead",
            entityId: leadId,
            details: { clientId: response.id }
          });
        } catch (error) {
          logger.error("Error creating project from lead:", error);
        }
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      navigate("/clients");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (data: ClientFormValues) => {
      // Convert date strings to ISO format for the API
      const formattedData = {
        ...data,
        onboardedDate: data.onboardedDate ? new Date(data.onboardedDate).toISOString() : undefined,
      };
      return api.patch(`/api/clients/${client?.id}`, formattedData);
    },
    onSuccess: async () => {
      toast({
        title: "Client updated",
        description: "Client has been updated successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/clients/${client?.id}`] });
      navigate(`/clients/${client?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientFormValues) => {
    if (isEdit && client) {
      updateClientMutation.mutate(data);
    } else {
      createClientMutation.mutate(data);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Client" : "Create New Client"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onboardedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onboarded Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upsellOpportunity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Upsell Opportunity</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Main St, Suite 100, City, State, Zip"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this client..."
                      className="min-h-[120px]"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/clients")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={createClientMutation.isPending || updateClientMutation.isPending}
              >
                {isEdit ? "Update Client" : "Create Client"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
