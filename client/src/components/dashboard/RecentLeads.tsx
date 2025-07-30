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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            🎯 Recent Leads
          </CardTitle>
          <Link href="/leads">
            <Button variant="link" className="text-primary-600 hover:text-primary-500">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : leads && leads.length > 0 ? (
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <Link key={lead.id} href={`/leads/${lead.id}`}>
                <div className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                  lead.context === 'notrom' ? 'border-l-blue-500' : 'border-l-green-500'
                }`}>
                  <Avatar>
                    <AvatarFallback className={`text-white ${
                      lead.context === 'notrom' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {getInitials(lead.companyName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{lead.companyName}</p>
                      <span className="text-xs">
                        {lead.context === 'notrom' ? '🏢' : '💼'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{lead.contactName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn("text-xs", getStatusBadgeClass(lead.status))}>
                      {lead.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", getPriorityBadgeClass(lead.priority))}>
                      {lead.priority === 'high' && '🔥'} 
                      {lead.priority === 'medium' && '⚡'} 
                      {lead.priority === 'low' && '📝'} 
                      {lead.priority}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm text-gray-500">No leads found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MobileRecentLeads = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            🎯 Recent Leads
          </CardTitle>
          <Link href="/leads">
            <Button variant="link" size="sm">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="overflow-x-auto">
          <div className="space-y-2 min-w-0">
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
