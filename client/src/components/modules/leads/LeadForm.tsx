import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lead, insertLeadSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = insertLeadSchema.extend({
  status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]),
  priority: z.enum(["low", "medium", "high"]),
});

type LeadFormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  lead?: Lead;
  isEdit?: boolean;
}

export const LeadForm = ({ lead, isEdit = false }: LeadFormProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const defaultValues: LeadFormValues = {
    companyName: lead?.companyName || "",
    website: lead?.website || "",
    industry: lead?.industry || "",
    contactName: lead?.contactName || "",
    contactEmail: lead?.contactEmail || "",
    contactPhone: lead?.contactPhone || "",
    status: lead?.status || "new",
    priority: lead?.priority || "medium",
    notes: lead?.notes || "",
    source: lead?.source || "",
  };

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: LeadFormValues) => apiRequest("POST", "/api/leads", data),
    onSuccess: async () => {
      toast({
        title: "Lead created",
        description: "Lead has been created successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      navigate("/leads");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: (data: LeadFormValues) => apiRequest("PATCH", `/api/leads/${lead?.id}`, data),
    onSuccess: async () => {
      toast({
        title: "Lead updated",
        description: "Lead has been updated successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/leads/${lead?.id}`] });
      navigate(`/leads/${lead?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    if (isEdit && lead) {
      updateLeadMutation.mutate(data);
    } else {
      createLeadMutation.mutate(data);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Lead" : "Create New Lead"}</CardTitle>
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
                      <Input placeholder="https://example.com" {...field} />
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
                      <Input placeholder="Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source</FormLabel>
                    <FormControl>
                      <Input placeholder="Referral" {...field} />
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
                      <Input placeholder="john@example.com" {...field} />
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
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this lead..."
                      className="min-h-[120px]"
                      {...field}
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
                onClick={() => navigate("/leads")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={createLeadMutation.isPending || updateLeadMutation.isPending}
              >
                {isEdit ? "Update Lead" : "Create Lead"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
