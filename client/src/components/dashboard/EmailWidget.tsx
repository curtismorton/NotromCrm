import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, AlertCircle, Clock, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GmailConnector } from "@/components/gmail/GmailConnector";
import { useToast } from "@/hooks/use-toast";

interface EmailStats {
  totalEmails: number;
  needsResponse: number;
  overdue: number;
  avgResponseTime: number;
}

interface Email {
  id: number;
  subject: string;
  sender: string;
  receivedAt: string;
  needsResponse: boolean;
  isOverdue: boolean;
}

export function EmailWidget() {
  const [showGmailSetup, setShowGmailSetup] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<EmailStats>({
    queryKey: ["/api/emails/stats"],
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: emailsNeedingResponse, isLoading: emailsLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails/needs-response"],
    staleTime: 1 * 60 * 1000, // Fresh for 1 minute
    refetchOnWindowFocus: false,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to sync emails');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "Gmail emails synchronized successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/needs-response'] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync Gmail. Check your connection.",
        variant: "destructive",
      });
    },
  });

  if (showGmailSetup) {
    return <GmailConnector />;
  }

  const isLoading = statsLoading || emailsLoading;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Management
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGmailSetup(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Email Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.totalEmails || 0}</div>
                <div className="text-sm text-muted-foreground">Total Emails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats?.needsResponse || 0}</div>
                <div className="text-sm text-muted-foreground">Needs Response</div>
              </div>
            </div>

            {/* Overdue Emails Alert */}
            {stats && stats.overdue > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{stats.overdue} overdue emails</span>
                </div>
              </div>
            )}

            {/* Recent Emails Needing Response */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Needs Response</h4>
              {emailsNeedingResponse?.length ? (
                emailsNeedingResponse.slice(0, 3).map((email) => (
                  <div key={email.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{email.subject}</p>
                        <p className="text-xs text-muted-foreground">{email.sender}</p>
                      </div>
                      {email.isOverdue && (
                        <Badge variant="destructive" className="ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No emails need response</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                {syncMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Gmail
              </Button>
              <Button size="sm" className="flex-1">
                View All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}