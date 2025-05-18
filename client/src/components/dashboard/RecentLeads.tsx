import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead } from "@shared/schema";
import { cn } from "@/lib/utils";

export const RecentLeads = () => {
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const getStatusBadgeClass = (status: string) => {
    return `status-badge-${status}`;
  };

  const getPriorityBadgeClass = (priority: string) => {
    return `priority-badge-${priority}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b px-6 py-4">
        <CardTitle className="text-lg font-medium">Recent Leads</CardTitle>
        <Link href="/leads">
          <Button variant="link" className="text-primary-600 hover:text-primary-500">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  Priority
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24 mt-1" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24 mt-1" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Skeleton className="h-4 w-8 ml-auto" />
                      </td>
                    </tr>
                  ))
              ) : leads && leads.length > 0 ? (
                leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <Avatar>
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {getInitials(lead.companyName)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.companyName}</div>
                          <div className="text-sm text-gray-500">{lead.website}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.contactName}</div>
                      <div className="text-sm text-gray-500">{lead.contactEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={cn("text-xs", getStatusBadgeClass(lead.status))}>
                        {lead.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={cn("text-xs", getPriorityBadgeClass(lead.priority))}>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <Link href={`/leads/${lead.id}`}>
                        <Button variant="link" className="text-primary-600 hover:text-primary-900">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
