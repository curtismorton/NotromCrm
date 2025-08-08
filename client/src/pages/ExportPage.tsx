import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Database, Calendar, Users, FolderOpen, CheckCircle, Loader2 } from "lucide-react";

export default function ExportPage() {
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<string[]>(['tasks', 'leads']);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30' | '90' | '365'>('all');

  // Get data counts for display
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const exportMutation = useMutation({
    mutationFn: async (data: { modules: string[]; format: string; dateRange: string }) => {
      return api.post("/api/export", data);
    },
    onSuccess: (response: any) => {
      // Create download link
      const blob = new Blob([JSON.stringify(response)], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curtis-os-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your data has been downloaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Error loading export data.
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const modules = [
    {
      id: 'tasks',
      name: 'Tasks',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'All your tasks with status, priority, and dates',
      count: (stats as any)?.totalTasks || 0,
    },
    {
      id: 'leads',
      name: 'Leads',
      icon: <Users className="w-5 h-5" />,
      description: 'Lead information and pipeline status',
      count: (stats as any)?.totalLeads || 0,
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <FolderOpen className="w-5 h-5" />,
      description: 'Project details and progress',
      count: (stats as any)?.totalProjects || 0,
    },
    {
      id: 'clients',
      name: 'Clients',
      icon: <Users className="w-5 h-5" />,
      description: 'Client contact information and history',
      count: (stats as any)?.totalClients || 0,
    },
  ];

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleExport = () => {
    if (selectedModules.length === 0) {
      toast({
        title: "No modules selected",
        description: "Please select at least one module to export",
        variant: "destructive",
      });
      return;
    }

    exportMutation.mutate({
      modules: selectedModules,
      format,
      dateRange,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Download className="w-8 h-8 text-primary" />
          Export Data
        </h1>
        <p className="text-muted-foreground mt-2">
          Download your CurtisOS data in CSV or JSON format
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Select Data to Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => handleModuleToggle(module.id)}
                  />
                  <div className="flex-1 flex items-center gap-3">
                    {module.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={module.id}
                          className="font-medium cursor-pointer"
                        >
                          {module.name}
                        </label>
                        <Badge variant="secondary">{module.count} items</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">File Format</label>
                <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        CSV (Spreadsheet)
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        JSON (Raw Data)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={(value: 'all' | '30' | '90' | '365') => setDateRange(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Selected modules:</span>
                  <span className="font-medium">{selectedModules.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Format:</span>
                  <span className="font-medium uppercase">{format}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Date range:</span>
                  <span className="font-medium">
                    {dateRange === 'all' ? 'All time' : `Last ${dateRange} days`}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleExport}
                  disabled={exportMutation.isPending || selectedModules.length === 0}
                  className="w-full"
                >
                  {exportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>CSV format:</strong> Best for spreadsheet applications like Excel or Google Sheets.
              </p>
              <p>
                <strong>JSON format:</strong> Raw data format, ideal for developers or data analysis tools.
              </p>
              <p className="pt-2 text-xs">
                Your data will be downloaded directly to your device. No data is sent to external servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}