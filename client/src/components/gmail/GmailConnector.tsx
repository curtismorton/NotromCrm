import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface GmailConnectionStatus {
  connected: boolean;
  lastSync?: string;
  errorMessage?: string;
}

export function GmailConnector() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connectionStatus, isLoading } = useQuery<GmailConnectionStatus>({
    queryKey: ['/api/gmail/status'],
    retry: false,
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
        description: "Gmail emails have been synchronized successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync Gmail emails. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/gmail/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=500,height=600');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Gmail connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Integration
          {connectionStatus?.connected ? (
            <Badge variant="default" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-auto">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to enable AI-powered email management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connectionStatus?.connected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Gmail account to:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Sync emails that need responses</li>
              <li>• Generate AI-powered email replies</li>
              <li>• Track email response times</li>
              <li>• Monitor important communications</li>
            </ul>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Connect Gmail Account
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Last sync:</span>
              <span className="text-muted-foreground">
                {connectionStatus.lastSync 
                  ? new Date(connectionStatus.lastSync).toLocaleString()
                  : 'Never'
                }
              </span>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={syncMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {syncMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Emails Now
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}