import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "wouter";
import { insertDevPlanSchema, type DevPlan, type Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI components
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Create a schema for dev plan form validation
const formSchema = insertDevPlanSchema
  .extend({
    projectId: z.coerce.number().min(1, "Please select a project"),
    planningStartDate: z.date().optional(),
    planningEndDate: z.date().optional(),
    buildStartDate: z.date().optional(),
    buildEndDate: z.date().optional(),
    reviseStartDate: z.date().optional(),
    reviseEndDate: z.date().optional(),
    liveStartDate: z.date().optional(),
  })
  .refine(
    (data) => {
      // If planningEndDate exists, ensure it's after planningStartDate
      if (data.planningStartDate && data.planningEndDate) {
        return data.planningEndDate > data.planningStartDate;
      }
      return true;
    },
    {
      message: "Planning end date must be after start date",
      path: ["planningEndDate"],
    }
  )
  .refine(
    (data) => {
      // If buildEndDate exists, ensure it's after buildStartDate
      if (data.buildStartDate && data.buildEndDate) {
        return data.buildEndDate > data.buildStartDate;
      }
      return true;
    },
    {
      message: "Build end date must be after start date",
      path: ["buildEndDate"],
    }
  )
  .refine(
    (data) => {
      // If reviseEndDate exists, ensure it's after reviseStartDate
      if (data.reviseStartDate && data.reviseEndDate) {
        return data.reviseEndDate > data.reviseStartDate;
      }
      return true;
    },
    {
      message: "Revise end date must be after start date",
      path: ["reviseEndDate"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface DevPlanFormProps {
  projects: Project[];
  initialData?: DevPlan;
  onSuccess?: () => void;
}

export const DevPlanForm = ({ projects, initialData, onSuccess }: DevPlanFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useNavigate();

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      projectId: initialData?.projectId || 0,
      currentStage: initialData?.currentStage || "planning",
      planningNotes: initialData?.planningNotes || "",
      buildNotes: initialData?.buildNotes || "",
      reviseNotes: initialData?.reviseNotes || "",
      liveNotes: initialData?.liveNotes || "",
      planningStartDate: initialData?.planningStartDate ? new Date(initialData.planningStartDate) : undefined,
      planningEndDate: initialData?.planningEndDate ? new Date(initialData.planningEndDate) : undefined,
      buildStartDate: initialData?.buildStartDate ? new Date(initialData.buildStartDate) : undefined,
      buildEndDate: initialData?.buildEndDate ? new Date(initialData.buildEndDate) : undefined,
      reviseStartDate: initialData?.reviseStartDate ? new Date(initialData.reviseStartDate) : undefined,
      reviseEndDate: initialData?.reviseEndDate ? new Date(initialData.reviseEndDate) : undefined,
      liveStartDate: initialData?.liveStartDate ? new Date(initialData.liveStartDate) : undefined,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        // Update existing plan
        await apiRequest(`/api/dev-plans/${initialData.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        toast({
          title: "Development plan updated",
          description: "The development plan has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/dev-plans"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dev-plans", initialData.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", initialData.projectId, "dev-plan"] });
      } else {
        // Create new plan
        const result = await apiRequest("/api/dev-plans", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast({
          title: "Development plan created",
          description: "The development plan has been created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/dev-plans"] });
        queryClient.invalidateQueries({ queryKey: ["/api/projects", values.projectId, "dev-plan"] });

        // Navigate to the new plan or project page
        if (result?.id) {
          navigate(`/projects/${values.projectId}`);
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving development plan:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the development plan.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Callback for date selection
  const handleDateSelect = (field: any, date: Date | undefined) => {
    field.onChange(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Development Plan" : "Create Development Plan"}</CardTitle>
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
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter plan name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Project</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                      disabled={!!initialData} // Disable if editing an existing plan
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
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
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter plan description"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stage</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="build">Build</SelectItem>
                        <SelectItem value="revise">Revise</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Planning Stage Section */}
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Planning Stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="planningStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select start date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planningEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="planningNotes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Planning Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter planning notes"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Build Stage Section */}
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Build Stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="buildStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select start date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buildEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buildNotes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Build Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter build notes"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Revise Stage Section */}
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Revise Stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reviseStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select start date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviseEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviseNotes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Revise Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter revise notes"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Live Stage Section */}
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Live Stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="liveStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Launch Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                !field.value ? "text-muted-foreground" : ""
                              }
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select launch date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateSelect(field, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="hidden md:block">
                  {/* Empty div for grid alignment */}
                </div>

                <FormField
                  control={form.control}
                  name="liveNotes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Live Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter live notes"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};