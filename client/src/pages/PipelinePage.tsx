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
    <div className="min-h-screen overflow-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header with mobile optimization */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Business Pipeline</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Complete client workflow management - track leads from first contact to project delivery
          </p>
        </div>
      </div>

      {/* Pipeline Stats Cards - Mobile responsive grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <PipelineStatsCard
          title="Today's Tasks"
          value={pipelineStats?.todaysTasks || 0}
          description="Due today"
        />
        <PipelineStatsCard
          title="Week Deliveries"
          value={pipelineStats?.thisWeekDeliveries || 0}
          description="This week"
        />
        <PipelineStatsCard
          title="Follow Ups"
          value={pipelineStats?.leadsToFollowUp || 0}
          description="Leads pending"
        />
        <PipelineStatsCard
          title="Revisions"
          value={pipelineStats?.outstandingRevisions || 0}
          description="Client feedback"
        />
        <PipelineStatsCard
          title="Missing Forms"
          value={pipelineStats?.incompleteOnboardingForms || 0}
          description="Onboarding"
        />
      </div>

      {/* Main Pipeline Views - Mobile optimized tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="pipeline" className="text-xs sm:text-sm p-2 sm:p-3">
            Lead Pipeline
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-xs sm:text-sm p-2 sm:p-3">
            Automation
          </TabsTrigger>
          <TabsTrigger value="daily-ops" className="text-xs sm:text-sm p-2 sm:p-3">
            Daily Ops
          </TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs sm:text-sm p-2 sm:p-3">
            Delivery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Lead & Client Pipeline</CardTitle>
              <CardDescription className="text-sm">
                🎯 <strong>Drag & drop leads</strong> between stages to track progress from initial contact to project completion. 
                Each column represents a stage in your sales process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadPipelineKanban />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Task Automation Planning</CardTitle>
              <CardDescription className="text-sm">
                🤖 <strong>Plan and track automations</strong> using Zapier, Make, or custom scripts. 
                Reduce repetitive tasks and improve efficiency across your workflow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationTasksView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-ops" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Daily & Weekly Operations</CardTitle>
              <CardDescription className="text-sm">
                📅 <strong>Focus on what matters today.</strong> See urgent tasks, upcoming deadlines, 
                and weekly priorities in one organized view.
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