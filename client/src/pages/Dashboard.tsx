import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { Users, FolderKanban, Building2, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex mt-3 space-x-3 sm:mt-0">
            <Button asChild>
              <Link href="/leads/new">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 -ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Lead
              </Link>
            </Button>
            <Button variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2 -ml-1 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={statsLoading ? "..." : stats?.totalLeads || 0}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-primary-500"
          changePercentage={12}
        />
        <StatsCard
          title="Active Projects"
          value={statsLoading ? "..." : stats?.activeProjects || 0}
          icon={<FolderKanban className="w-5 h-5" />}
          iconBgColor="bg-secondary-500"
          changePercentage={7}
        />
        <StatsCard
          title="Total Clients"
          value={statsLoading ? "..." : stats?.totalClients || 0}
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-accent-500"
          changePercentage={3}
        />
        <StatsCard
          title="Overdue Tasks"
          value={statsLoading ? "..." : stats?.overdueTasks || 0}
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-red-500"
          changePercentage={-15}
        />
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <RecentLeads />
        </div>

        {/* Sidebar content */}
        <div>
          <UpcomingTasks />
          
          <div className="mt-6">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
