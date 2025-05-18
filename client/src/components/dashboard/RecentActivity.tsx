import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import {
  Edit,
  CheckCircle,
  UserPlus,
  Plus,
  Trash2,
} from "lucide-react";

export const RecentActivity = () => {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/recent-activities"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="w-5 h-5 text-primary-600" />;
      case "update":
        return <Edit className="w-5 h-5 text-primary-600" />;
      case "delete":
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "tag":
        return <Plus className="w-5 h-5 text-accent-600" />;
      default:
        return <UserPlus className="w-5 h-5 text-primary-600" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const entityType = activity.entityType.charAt(0).toUpperCase() + activity.entityType.slice(1);
    const details = activity.details as any;
    
    switch (activity.action) {
      case "create":
        return (
          <>
            <span className="font-medium text-gray-900">You</span> created a new{" "}
            <span className="font-medium text-gray-900">{entityType}</span>
            {details?.name && `: ${details.name}`}
            {details?.companyName && `: ${details.companyName}`}
            {details?.title && `: ${details.title}`}
          </>
        );
      case "update":
        return (
          <>
            <span className="font-medium text-gray-900">You</span> updated the{" "}
            <span className="font-medium text-gray-900">{entityType}</span>
            {details?.changes?.status && (
              <>
                {" "}status to <span className="font-medium text-green-600">{details.changes.status.replace(/_/g, " ")}</span>
              </>
            )}
          </>
        );
      case "complete":
        return (
          <>
            <span className="font-medium text-gray-900">You</span> completed the{" "}
            <span className="font-medium text-gray-900">task</span>
            {details?.title && `: ${details.title}`}
          </>
        );
      case "delete":
        return (
          <>
            <span className="font-medium text-gray-900">You</span> deleted a{" "}
            <span className="font-medium text-gray-900">{entityType}</span>
          </>
        );
      case "tag":
        return (
          <>
            <span className="font-medium text-gray-900">You</span> added tag{" "}
            <span className="font-medium text-accent-600">{details?.tagName}</span> to a{" "}
            <span className="font-medium text-gray-900">{entityType}</span>
          </>
        );
      default:
        return (
          <>
            <span className="font-medium text-gray-900">You</span> performed an action on{" "}
            <span className="font-medium text-gray-900">{entityType}</span>
          </>
        );
    }
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="h-full">
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </li>
              ))
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
                    {getActivityIcon(activity.action)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getTimeAgo(activity.createdAt.toString())}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500">No recent activity</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};
