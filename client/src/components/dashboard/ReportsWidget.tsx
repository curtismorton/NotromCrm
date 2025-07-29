import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReportsWidgetProps {
  context?: string;
}

export function ReportsWidget({ context }: ReportsWidgetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/reports", { context, limit: 10 }],
  });

  const generateTalentReportMutation = useMutation({
    mutationFn: () => apiRequest("/api/reports/talent", {
      method: "POST",
      body: JSON.stringify(dateRange),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Success",
        description: "Talent report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate talent report",
        variant: "destructive",
      });
    },
  });

  const generatePodcastReportMutation = useMutation({
    mutationFn: () => apiRequest("/api/reports/podcast", {
      method: "POST",
      body: JSON.stringify(dateRange),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Success",
        description: "Podcast report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate podcast report",
        variant: "destructive",
      });
    },
  });

  const generateNotromReportMutation = useMutation({
    mutationFn: () => apiRequest("/api/reports/notrom", {
      method: "POST",
      body: JSON.stringify(dateRange),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Success",
        description: "Notrom revenue report generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate Notrom report",
        variant: "destructive",
      });
    },
  });

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'talent_summary': return 'Talent Management';
      case 'podcast_analytics': return 'Podcast Analytics';
      case 'notrom_revenue': return 'Notrom Revenue';
      case 'monthly_overview': return 'Monthly Overview';
      default: return type;
    }
  };

  const getContextColor = (reportContext: string) => {
    switch (reportContext) {
      case 'day_job': return 'bg-blue-100 text-blue-800';
      case 'podcast': return 'bg-purple-100 text-purple-800';
      case 'notrom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            />
            <span className="py-2">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              onClick={() => generateTalentReportMutation.mutate()}
              disabled={generateTalentReportMutation.isPending}
              variant="outline"
              size="sm"
            >
              {generateTalentReportMutation.isPending ? "Generating..." : "Talent Report"}
            </Button>
            
            <Button
              onClick={() => generatePodcastReportMutation.mutate()}
              disabled={generatePodcastReportMutation.isPending}
              variant="outline"
              size="sm"
            >
              {generatePodcastReportMutation.isPending ? "Generating..." : "Podcast Report"}
            </Button>
            
            <Button
              onClick={() => generateNotromReportMutation.mutate()}
              disabled={generateNotromReportMutation.isPending}
              variant="outline"
              size="sm"
            >
              {generateNotromReportMutation.isPending ? "Generating..." : "Notrom Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports?.map((report: any) => (
              <ReportItem key={report.id} report={report} />
            ))}
            {!reports?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reports generated yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportItem({ report }: { report: any }) {
  const [expanded, setExpanded] = useState(false);

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'talent_summary': return 'Talent Management';
      case 'podcast_analytics': return 'Podcast Analytics';
      case 'notrom_revenue': return 'Notrom Revenue';
      case 'monthly_overview': return 'Monthly Overview';
      default: return type;
    }
  };

  const getContextColor = (reportContext: string) => {
    switch (reportContext) {
      case 'day_job': return 'bg-blue-100 text-blue-800';
      case 'podcast': return 'bg-purple-100 text-purple-800';
      case 'notrom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{getReportTypeLabel(report.type)}</h3>
          <Badge className={getContextColor(report.context)}>
            {report.context.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(report.generatedAt).toLocaleDateString()}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide" : "View"}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-md">
          {/* Metrics Display */}
          {report.content?.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.content.metrics).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold">
                    {typeof value === 'number' ? 
                      (key.includes('Revenue') || key.includes('Value') ? 
                        `$${value.toLocaleString()}` : 
                        key.includes('Rate') ? 
                          `${value}%` : 
                          value.toLocaleString()
                      ) : value
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {report.content?.aiInsights && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                AI Insights
              </h4>
              <ul className="space-y-2">
                {report.content.aiInsights.map((insight: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 pl-4 border-l-2 border-blue-200">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Achievements */}
          {report.content?.recentAchievements && (
            <div>
              <h4 className="font-medium mb-2">Recent Achievements</h4>
              <div className="space-y-2">
                {report.content.recentAchievements.slice(0, 3).map((achievement: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{achievement.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {achievement.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}