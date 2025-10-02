import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Send,
  CheckCircle,
  ListTodo,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TriagedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  suggestedAction: 'reply' | 'review' | 'archive' | 'task';
  aiSummary: string;
  aiKeyPoints: string[];
  extractedData: {
    campaignName?: string;
    deliverableName?: string;
    dueDate?: string;
    talentName?: string;
  };
}

interface ReplyOptions {
  quick: string;
  detailed: string;
  friendly: string;
}

export default function InboxPage() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyOptions, setReplyOptions] = useState<ReplyOptions | null>(null);
  const [selectedReplyType, setSelectedReplyType] = useState<'quick' | 'detailed' | 'friendly'>('quick');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const { toast } = useToast();

  const { data: emails = [], isLoading } = useQuery<TriagedEmail[]>({
    queryKey: ['/api/emails'],
  });

  const selectedEmail = emails.find(email => email.id === selectedEmailId);

  const markReadMutation = useMutation({
    mutationFn: async (emailId: string) => {
      return apiRequest('POST', `/api/emails/${emailId}/mark-read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      toast({
        title: "Marked as read",
        description: "Email has been marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark email as read",
        variant: "destructive",
      });
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ emailId, replyText }: { emailId: string; replyText: string }) => {
      return apiRequest('POST', `/api/emails/${emailId}/reply`, { replyText });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails'] });
      setReplyDialogOpen(false);
      setReplyOptions(null);
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleQuickReply = async (email: TriagedEmail) => {
    setIsGeneratingReply(true);
    try {
      const response = await apiRequest('POST', `/api/emails/${email.id}/generate-reply`, {
        subject: email.subject,
        body: email.body,
        fromEmail: email.fromEmail,
      }) as unknown as ReplyOptions;
      setReplyOptions(response);
      setReplyDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate reply options",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendReply = () => {
    if (!selectedEmail || !replyOptions) return;
    
    const replyText = replyOptions[selectedReplyType];
    sendReplyMutation.mutate({ emailId: selectedEmail.id, replyText });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'var(--danger-500)';
      case 'high':
        return 'var(--alert-yellow-500)';
      case 'medium':
      case 'low':
        return 'var(--action-cyan-500)';
      default:
        return 'var(--ink-400)';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Inbox</h1>
          <p className="text-meta">AI-powered email triage and smart responses</p>
        </div>
        <div className="glass-pill">
          {isLoading ? '...' : `${emails.length} emails`}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-24">
        {/* Email List - Left Side */}
        <div className="col-span-5 card">
          <div className="card__header">
            <h3 className="card__title">Messages</h3>
          </div>
          <div className="card__content p-0">
            {isLoading ? (
              <div className="space-y-2 p-16">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-16 space-y-8">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                ))}
              </div>
            ) : emails.length === 0 ? (
              <div className="p-24 text-center text-ink-400">
                <Mail className="w-12 h-12 mx-auto mb-8 opacity-40" />
                <p>No emails found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    data-testid={`email-item-${email.id}`}
                    className={`
                      p-16 cursor-pointer transition-all duration-160 relative
                      ${selectedEmailId === email.id 
                        ? 'bg-action-cyan-500 bg-opacity-8 border-l-2'
                        : 'hover:bg-surface-2'
                      }
                    `}
                    style={{
                      borderLeftColor: selectedEmailId === email.id ? getPriorityColor(email.priority) : 'transparent'
                    }}
                  >
                    <div className="flex items-start gap-12">
                      <div 
                        className="mt-4 flex items-center justify-center w-8 h-8"
                        style={{ color: getPriorityColor(email.priority) }}
                      >
                        {getPriorityIcon(email.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-8 flex-1 min-w-0">
                            <p className="font-medium text-ink-200 truncate">{email.from}</p>
                            {email.unread && (
                              <div className="w-2 h-2 rounded-full bg-action-cyan-500 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-meta flex-shrink-0 ml-8">
                            <Clock className="w-3 h-3 inline mr-4" />
                            {formatDate(email.date)}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-ink-200 mb-4 truncate">{email.subject}</h4>
                        <p className="text-meta text-sm truncate">{email.snippet}</p>
                        <div className="flex items-center gap-8 mt-8">
                          <div 
                            className="glass-pill text-xs"
                            style={{ 
                              borderColor: getPriorityColor(email.priority),
                              color: getPriorityColor(email.priority)
                            }}
                          >
                            {email.priority.toUpperCase()}
                          </div>
                          {email.extractedData.campaignName && (
                            <div className="glass-pill text-xs">
                              {email.extractedData.campaignName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Detail - Right Side */}
        <div className="col-span-7">
          {!selectedEmail ? (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center text-ink-400">
                <Mail className="w-16 h-16 mx-auto mb-12 opacity-20" />
                <p>Select an email to view details</p>
              </div>
            </div>
          ) : (
            <div className="space-y-24">
              {/* Email Header Card */}
              <div className="card">
                <div className="card__content">
                  <div className="flex items-start justify-between mb-16">
                    <div className="flex-1">
                      <h2 className="text-h2 mb-8">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-12 text-meta">
                        <span>From: <strong className="text-ink-200">{selectedEmail.from}</strong></span>
                        <span>&lt;{selectedEmail.fromEmail}&gt;</span>
                      </div>
                    </div>
                    <div 
                      className="flex items-center gap-8 glass-pill"
                      style={{ 
                        borderColor: getPriorityColor(selectedEmail.priority),
                        color: getPriorityColor(selectedEmail.priority)
                      }}
                    >
                      {getPriorityIcon(selectedEmail.priority)}
                      {selectedEmail.priority.toUpperCase()}
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="p-16 rounded-lg mb-16" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                    <h4 className="text-meta mb-8 flex items-center gap-8">
                      <span className="w-2 h-2 rounded-full bg-action-cyan-500" />
                      AI SUMMARY
                    </h4>
                    <p className="text-body text-sm mb-12">{selectedEmail.aiSummary}</p>
                    
                    {selectedEmail.aiKeyPoints.length > 0 && (
                      <div className="space-y-8">
                        <h5 className="text-meta">KEY POINTS:</h5>
                        <ul className="space-y-4">
                          {selectedEmail.aiKeyPoints.map((point, idx) => (
                            <li key={idx} className="text-sm text-ink-300 flex items-start gap-8">
                              <span className="text-action-cyan-500 mt-4">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Extracted Data */}
                  {(selectedEmail.extractedData.campaignName || 
                    selectedEmail.extractedData.deliverableName || 
                    selectedEmail.extractedData.talentName || 
                    selectedEmail.extractedData.dueDate) && (
                    <div className="p-16 rounded-lg mb-16" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                      <h4 className="text-meta mb-12">EXTRACTED DATA</h4>
                      <div className="flex flex-wrap gap-8">
                        {selectedEmail.extractedData.campaignName && (
                          <div className="glass-pill">
                            <strong>Campaign:</strong> {selectedEmail.extractedData.campaignName}
                          </div>
                        )}
                        {selectedEmail.extractedData.deliverableName && (
                          <div className="glass-pill">
                            <strong>Deliverable:</strong> {selectedEmail.extractedData.deliverableName}
                          </div>
                        )}
                        {selectedEmail.extractedData.talentName && (
                          <div className="glass-pill">
                            <strong>Talent:</strong> {selectedEmail.extractedData.talentName}
                          </div>
                        )}
                        {selectedEmail.extractedData.dueDate && (
                          <div className="glass-pill">
                            <strong>Due:</strong> {new Date(selectedEmail.extractedData.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email Body */}
                  <div className="text-body space-y-12" style={{ maxWidth: '64ch', lineHeight: '1.6' }}>
                    {selectedEmail.body.split('\n').map((paragraph, idx) => (
                      paragraph.trim() && <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Card */}
              <div className="card">
                <div className="card__content">
                  <h4 className="text-meta mb-12">SMART ACTIONS</h4>
                  <div className="flex items-center gap-12 flex-wrap">
                    <button 
                      className="btn btn--primary"
                      onClick={() => handleQuickReply(selectedEmail)}
                      disabled={isGeneratingReply}
                      data-testid="btn-quick-reply"
                    >
                      {isGeneratingReply ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Quick Reply
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn--secondary"
                      onClick={() => markReadMutation.mutate(selectedEmail.id)}
                      disabled={markReadMutation.isPending || !selectedEmail.unread}
                      data-testid="btn-mark-read"
                    >
                      {markReadMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark as Read
                    </button>
                    <button 
                      className="btn btn--secondary"
                      data-testid="btn-create-task"
                    >
                      <ListTodo className="w-4 h-4" />
                      Create Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Reply Options</DialogTitle>
            <DialogDescription>
              Choose the tone that best fits your response
            </DialogDescription>
          </DialogHeader>
          
          {replyOptions && (
            <div className="space-y-16">
              <div className="flex items-center gap-12">
                <button
                  className={`btn flex-1 ${selectedReplyType === 'quick' ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setSelectedReplyType('quick')}
                  data-testid="reply-type-quick"
                >
                  Quick
                </button>
                <button
                  className={`btn flex-1 ${selectedReplyType === 'detailed' ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setSelectedReplyType('detailed')}
                  data-testid="reply-type-detailed"
                >
                  Detailed
                </button>
                <button
                  className={`btn flex-1 ${selectedReplyType === 'friendly' ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setSelectedReplyType('friendly')}
                  data-testid="reply-type-friendly"
                >
                  Friendly
                </button>
              </div>

              <div className="p-16 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', minHeight: '150px' }}>
                <p className="text-body whitespace-pre-wrap">{replyOptions[selectedReplyType]}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button 
              className="btn btn--secondary"
              onClick={() => setReplyDialogOpen(false)}
              data-testid="btn-cancel-reply"
            >
              Cancel
            </button>
            <button 
              className="btn btn--primary"
              onClick={handleSendReply}
              disabled={sendReplyMutation.isPending}
              data-testid="btn-send-reply"
            >
              {sendReplyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Reply
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
