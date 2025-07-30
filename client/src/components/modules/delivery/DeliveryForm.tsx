import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertDeliverySchema, type Delivery, type InsertDelivery, type Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface DeliveryFormProps {
  delivery?: Delivery;
  onSuccess?: () => void;
}

export function DeliveryForm({ delivery, onSuccess }: DeliveryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!delivery;

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<InsertDelivery>({
    resolver: zodResolver(insertDeliverySchema),
    defaultValues: {
      clientId: delivery?.clientId || undefined,
      projectId: delivery?.projectId || undefined,
      leadId: delivery?.leadId || undefined,
      clientName: delivery?.clientName || "",
      businessType: delivery?.businessType || undefined,
      assignedTemplate: delivery?.assignedTemplate || "",
      templateUrl: delivery?.templateUrl || "",
      copyPromptGenerated: delivery?.copyPromptGenerated || false,
      buildStarted: delivery?.buildStarted || false,
      buildUrl: delivery?.buildUrl || "",
      revisionRoundUsed: delivery?.revisionRoundUsed || false,
      revisionNotes: delivery?.revisionNotes || "",
      hostingPlan: delivery?.hostingPlan || false,
      hostingUrl: delivery?.hostingUrl || "",
      finalReviewDate: delivery?.finalReviewDate ? new Date(delivery.finalReviewDate).toISOString().slice(0, 16) : "",
      status: delivery?.status || "template_assigned",
      deliveryDate: delivery?.deliveryDate ? new Date(delivery.deliveryDate).toISOString().slice(0, 16) : "",
      notes: delivery?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertDelivery) => {
      // Convert date strings to proper ISO format
      const processedData = {
        ...data,
        finalReviewDate: data.finalReviewDate ? new Date(data.finalReviewDate).toISOString() : null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : null,
      };

      if (isEditing) {
        return apiRequest(`/api/deliveries/${delivery.id}`, {
          method: "PATCH",
          body: processedData,
        });
      } else {
        return apiRequest("/api/deliveries", {
          method: "POST",
          body: processedData,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deliveries"] });
      toast({
        title: "Success",
        description: `Delivery ${isEditing ? "updated" : "created"} successfully`,
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? "update" : "create"} delivery`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDelivery) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    const selectedClient = clients.find(c => c.id === parseInt(value));
                    if (selectedClient) {
                      form.setValue('clientName', selectedClient.companyName);
                      form.setValue('businessType', selectedClient.industry as any);
                    }
                  }} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="salon">Salon</SelectItem>
                    <SelectItem value="trades">Trades</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="professional_services">Professional Services</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="nonprofit">Nonprofit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="template_assigned">Template Assigned</SelectItem>
                    <SelectItem value="copy_prompt_generated">Copy Prompt Generated</SelectItem>
                    <SelectItem value="build_started">Build Started</SelectItem>
                    <SelectItem value="build_completed">Build Completed</SelectItem>
                    <SelectItem value="client_review">Client Review</SelectItem>
                    <SelectItem value="revision_requested">Revision Requested</SelectItem>
                    <SelectItem value="final_approved">Final Approved</SelectItem>
                    <SelectItem value="hosting_setup">Hosting Setup</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignedTemplate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Template</FormLabel>
                <FormControl>
                  <Input placeholder="Template name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="templateUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://template-url.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="buildUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Build URL</FormLabel>
              <FormControl>
                <Input placeholder="https://build-preview.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="finalReviewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Review Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hostingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hosting URL</FormLabel>
              <FormControl>
                <Input placeholder="https://client-website.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="copyPromptGenerated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Copy Prompt Generated?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buildStarted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Build Started?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="revisionRoundUsed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Revision Round Used?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hostingPlan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Hosting Plan?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="revisionNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revision Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notes about revisions requested"
                  {...field} 
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
                  placeholder="Additional notes about this delivery"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update" : "Create"} Delivery
          </Button>
        </div>
      </form>
    </Form>
  );
}