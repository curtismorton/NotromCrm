import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, CheckSquare, Building2 } from "lucide-react";
import { Project } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const ProjectTable = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: async () => {
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    setSelectedProjectId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProjectId) {
      deleteMutation.mutate(selectedProjectId);
    }
    setDeleteDialogOpen(false);
  };

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (project: Project) => (
        <div className="font-medium">{project.name}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (project: Project) => (
        <Badge variant="outline" className={cn("status-badge-" + project.status)}>
          {project.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Timeline",
      accessorKey: "deadline",
      cell: (project: Project) => (
        <div>
          {project.startDate && (
            <div className="text-xs text-muted-foreground">
              Start: {format(new Date(project.startDate), "MMM d, yyyy")}
            </div>
          )}
          {project.deadline && (
            <div className="text-xs">
              Deadline: {format(new Date(project.deadline), "MMM d, yyyy")}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Budget",
      accessorKey: "budget",
      cell: (project: Project) => (
        <div>
          {project.budget ? (
            <div className="font-medium">${project.budget.toLocaleString()}</div>
          ) : (
            <div className="text-muted-foreground">Not set</div>
          )}
        </div>
      ),
    },
    {
      header: "Contract",
      accessorKey: "contractSigned",
      cell: (project: Project) => (
        <div>
          {project.contractSigned ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">Signed</Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
          )}
        </div>
      ),
    },
  ];

  const renderRowActions = (project: Project) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/projects/${project.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/tasks/new?projectId=${project.id}`}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Add Task</span>
          </Link>
        </DropdownMenuItem>
        {project.leadId && !project.clientId && (
          <DropdownMenuItem asChild>
            <Link href={`/clients/new?leadId=${project.leadId}`}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Convert to Client</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(project.id);
          }}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={projects || []}
        isLoading={isLoading}
        searchField="name"
        renderRowActions={renderRowActions}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
