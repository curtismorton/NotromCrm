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
import { Client } from "@shared/schema";
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

export const ClientTable = () => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/clients/${id}`),
    onSuccess: async () => {
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    setSelectedClientId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClientId) {
      deleteMutation.mutate(selectedClientId);
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
      cell: (client: Client) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="bg-accent-100 text-accent-800 text-xs">
              {getInitials(client.companyName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{client.companyName}</div>
            <div className="text-xs text-muted-foreground">{client.website}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactName",
      cell: (client: Client) => (
        <div>
          <div className="font-medium">{client.contactName}</div>
          <div className="text-xs text-muted-foreground">{client.contactEmail}</div>
        </div>
      ),
    },
    {
      header: "Industry",
      accessorKey: "industry",
    },
    {
      header: "Onboarded",
      accessorKey: "onboardedDate",
      cell: (client: Client) => (
        <div>
          {client.onboardedDate ? (
            format(new Date(client.onboardedDate), "MMM d, yyyy")
          ) : (
            <div className="text-muted-foreground">Not set</div>
          )}
        </div>
      ),
    },
    {
      header: "Upsell",
      accessorKey: "upsellOpportunity",
      cell: (client: Client) => (
        <div>
          {client.upsellOpportunity ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">Yes</Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800">No</Badge>
          )}
        </div>
      ),
    },
  ];

  const renderRowActions = (client: Client) => (
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
          <Link href={`/clients/${client.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/projects/new?clientId=${client.id}`}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>Create Project</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(client.id);
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
        data={clients || []}
        isLoading={isLoading}
        searchField="companyName"
        renderRowActions={renderRowActions}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and may affect associated projects.
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
