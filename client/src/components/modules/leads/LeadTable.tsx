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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, MoreHorizontal, Trash2, FolderPlus } from "lucide-react";
import { Lead } from "@shared/schema";
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

export const LeadTable = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/leads/${id}`),
    onSuccess: async () => {
      toast({
        title: "Lead deleted",
        description: "The lead has been deleted successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    setSelectedLeadId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLeadId) {
      deleteMutation.mutate(selectedLeadId);
    }
    setDeleteDialogOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const columns = [
    {
      header: "Company",
      accessorKey: "companyName",
      cell: (lead: Lead) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-primary-100 text-primary-800 text-xs">
              {getInitials(lead.companyName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{lead.companyName}</div>
            <div className="text-xs text-muted-foreground">{lead.website}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactName",
      cell: (lead: Lead) => (
        <div>
          <div className="font-medium">{lead.contactName}</div>
          <div className="text-xs text-muted-foreground">{lead.contactEmail}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (lead: Lead) => (
        <Badge variant="outline" className={cn("status-badge-" + lead.status)}>
          {lead.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (lead: Lead) => (
        <Badge variant="outline" className={cn("priority-badge-" + lead.priority)}>
          {lead.priority}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (lead: Lead) => format(new Date(lead.createdAt), "MMM d, yyyy"),
    },
  ];

  const renderRowActions = (lead: Lead) => (
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
          <Link href={`/leads/${lead.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/projects/new?leadId=${lead.id}`}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>Create Project</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(lead.id);
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
        data={leads || []}
        isLoading={isLoading}
        searchField="companyName"
        renderRowActions={renderRowActions}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lead
              and all associated data.
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
