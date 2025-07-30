import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadPipelineKanban } from "@/components/modules/pipeline/LeadPipelineKanban";
import { AutomationTasksView } from "@/components/modules/pipeline/AutomationTasksView";
import { DailyOpsView } from "@/components/modules/pipeline/DailyOpsView";
import { DeliveryTrackerView } from "@/components/modules/pipeline/DeliveryTrackerView";
import { PipelineStatsCard } from "@/components/modules/pipeline/PipelineStatsCard";

export default function PipelinePage() {
  const { data: pipelineStats } = useQuery({
    queryKey: ["/api/dashboard/pipeline-stats"],
  });

  return (
    <div className="h-screen overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your complete client workflow from lead to delivery
          </p>
        </div>
      </div>

      {/* Pipeline Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <PipelineStatsCard
          title="Today's Tasks"
          value={pipelineStats?.todaysTasks || 0}
          description="Tasks due today"
        />
        <PipelineStatsCard
          title="This Week Deliveries"
          value={pipelineStats?.thisWeekDeliveries || 0}
          description="Deliveries this week"
        />
        <PipelineStatsCard
          title="Leads to Follow Up"
          value={pipelineStats?.leadsToFollowUp || 0}
          description="Contacted leads pending"
        />
        <PipelineStatsCard
          title="Outstanding Revisions"
          value={pipelineStats?.outstandingRevisions || 0}
          description="Awaiting client feedback"
        />
        <PipelineStatsCard
          title="Incomplete Forms"
          value={pipelineStats?.incompleteOnboardingForms || 0}
          description="Missing onboarding forms"
        />
      </div>

      {/* Main Pipeline Views */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Lead Pipeline</TabsTrigger>
          <TabsTrigger value="automation">Task Automation</TabsTrigger>
          <TabsTrigger value="daily-ops">Daily + Weekly Ops</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead & Client Pipeline</CardTitle>
              <CardDescription>
                Track every prospect, lead, and client through the entire funnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadPipelineKanban />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Automation View</CardTitle>
              <CardDescription>
                Plan and manage automations via Zapier, Make, and custom scripts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationTasksView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-ops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily + Weekly Operations</CardTitle>
              <CardDescription>
                Your focused view of what needs attention today and this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyOpsView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Tracker</CardTitle>
              <CardDescription>
                Track every website build through its development lifecycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryTrackerView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}