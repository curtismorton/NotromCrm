import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Project, insertProjectSchema, Lead, Client } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const formSchema = insertProjectSchema.extend({
  status: z.enum(["planning", "onboarding", "in_progress", "review", "completed", "on_hold", "cancelled"]),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  completedDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  project?: Project;
  isEdit?: boolean;
  leadId?: number;
}

export const ProjectForm = ({ project, isEdit = false, leadId }: ProjectFormProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Format dates for form
  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return format(new Date(date), "yyyy-MM-dd");
  };
  
  // Get leads for dropdown
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
  
  // Get clients for dropdown
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });
  
  const defaultValues: Partial<ProjectFormValues> = {
    name: project?.name || "",
    description: project?.description || "",
    status: project?.status || "planning",
    startDate: formatDateForInput(project?.startDate),
    deadline: formatDateForInput(project?.deadline),
    completedDate: formatDateForInput(project?.completedDate),
    budget: project?.budget || undefined,
    leadId: project?.leadId || leadId || undefined,
    clientId: project?.clientId || undefined,
    contractSigned: project?.contractSigned || false,
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => {
      // Convert date strings to ISO format for the API
      const formattedData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate).toISOString() : undefined,
      };
      return apiRequest("POST", "/api/projects", formattedData);
    },
    onSuccess: async () => {
      toast({
        title: "Project created",
        description: "Project has been created successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      navigate("/projects");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => {
      // Convert date strings to ISO format for the API
      const formattedData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate).toISOString() : undefined,
      };
      return apiRequest("PATCH", `/api/projects/${project?.id}`, formattedData);
    },
    onSuccess: async () => {
      toast({
        title: "Project updated",
        description: "Project has been updated successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${project?.id}`] });
      navigate(`/projects/${project?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    if (isEdit && project) {
      updateProjectMutation.mutate(data);
    } else {
      createProjectMutation.mutate(data);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Project" : "Create New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation Website" {...field} />
                    </FormControl>
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
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leads?.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id.toString()}>
                            {lead.companyName}
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
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client) => (
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
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractSigned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Contract Signed</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.watch('status') === 'completed' || project?.status === 'completed') && (
                <FormField
                  control={form.control}
                  name="completedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about this project..."
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
                onClick={() => navigate("/projects")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
              >
                {isEdit ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
