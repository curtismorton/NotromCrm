import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, AlertCircle, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EmailWidgetProps {
  context?: string;
}

export function EmailWidget({ context }: EmailWidgetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const { data: emailStats } = useQuery({
    queryKey: ["/api/emails/stats"],
  });

  const { data: emailsNeedingResponse } = useQuery({
    queryKey: ["/api/emails/needs-response"],
  });

  const syncEmailsMutation = useMutation({
    mutationFn: () => apiRequest("/api/emails/sync", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({
        title: "Success",
        description: "Emails synced successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync emails",
        variant: "destructive",
      });
    },
  });

  const markRespondedMutation = useMutation({
    mutationFn: (emailId: number) => apiRequest(`/api/emails/${emailId}/responded`, {
      method: "PATCH",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({
        title: "Success",
        description: "Email marked as responded",
      });
    },
  });

  const filteredEmails = context 
    ? emailsNeedingResponse?.filter((email: any) => email.context === context) 
    : emailsNeedingResponse;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Email Overview</CardTitle>
          <Button 
            size="sm" 
            onClick={() => syncEmailsMutation.mutate()}
            disabled={syncEmailsMutation.isPending}
          >
            <Mail className="w-4 h-4 mr-2" />
            {syncEmailsMutation.isPending ? "Syncing..." : "Sync"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{emailStats?.needsResponse || 0}</div>
              <p className="text-xs text-muted-foreground">Need Response</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{emailStats?.overdue || 0}</div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{emailStats?.totalEmails || 0}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Emails Needing Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEmails?.slice(0, 10).map((email: any) => (
              <div key={email.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{email.subject}</p>
                    <Badge variant={email.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {email.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">From: {email.fromName || email.fromEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    Context: {email.context} • Due: {email.responseNeededBy && new Date(email.responseNeededBy).toLocaleDateString()}
                  </p>
                  {email.aiSuggestedResponse && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <p className="font-medium text-blue-800 mb-1">AI Suggested Response:</p>
                      <p className="text-blue-700">{email.aiSuggestedResponse.slice(0, 100)}...</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => markRespondedMutation.mutate(email.id)}
                    disabled={markRespondedMutation.isPending}
                  >
                    Mark Done
                  </Button>
                </div>
              </div>
            ))}
            {!filteredEmails?.length && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No emails need response right now
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedEmail && (
        <EmailReplyModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
}

function EmailReplyModal({ email, onClose }: { email: any; onClose: () => void }) {
  const [reply, setReply] = useState(email.aiSuggestedResponse || "");
  const { toast } = useToast();

  const sendReplyMutation = useMutation({
    mutationFn: () => apiRequest("/api/emails/send", {
      method: "POST",
      body: JSON.stringify({
        to: email.fromEmail,
        subject: `Re: ${email.subject}`,
        body: reply,
      }),
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Reply to: {email.subject}</CardTitle>
          <p className="text-sm text-muted-foreground">To: {email.fromEmail}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Reply:</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full h-32 p-3 border rounded-md"
              placeholder="Type your reply..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => sendReplyMutation.mutate()}
              disabled={sendReplyMutation.isPending || !reply.trim()}
            >
              {sendReplyMutation.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}