import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Briefcase, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  ExternalLink,
  Clock
} from "lucide-react";
import { Lead } from "@shared/schema";

interface LeadCardListProps {
  context?: 'notrom' | 'day_job' | 'all';
}

export function LeadCardList({ context = 'all' }: LeadCardListProps) {
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const filteredLeads = context === 'all' 
    ? leads 
    : leads.filter(lead => lead.context === context);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'lead_identified': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'call_booked': 'bg-orange-100 text-orange-800',
      'onboarding_form_completed': 'bg-purple-100 text-purple-800',
      'build_in_progress': 'bg-indigo-100 text-indigo-800',
      'awaiting_feedback': 'bg-pink-100 text-pink-800',
      'revision_round': 'bg-red-100 text-red-800',
      'final_delivery': 'bg-green-100 text-green-800',
      'hosting_setup': 'bg-cyan-100 text-cyan-800',
      'complete': 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      'lead_identified': '🎯',
      'contacted': '📞',
      'call_booked': '📅',
      'onboarding_form_completed': '📋',
      'build_in_progress': '🔨',
      'awaiting_feedback': '⌛',
      'revision_round': '🔄',
      'final_delivery': '📦',
      'hosting_setup': '🌐',
      'complete': '✅',
    };
    return icons[status] || '📝';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leads...</div>;
  }

  if (filteredLeads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-lg font-semibold mb-2">No leads found</h3>
          <p className="text-muted-foreground">
            {context === 'all' 
              ? "You haven't added any leads yet." 
              : `No leads found for ${context === 'notrom' ? 'Notrom business' : 'day job'}.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className={`h-full transition-all hover:shadow-md border-l-4 ${
            lead.context === 'notrom' 
              ? 'border-l-blue-500' 
              : 'border-l-green-500'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">
                    {lead.context === 'notrom' ? '🏢' : '💼'}
                  </span>
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold truncate">
                      {lead.companyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(lead.status)} variant="secondary">
                        {getStatusIcon(lead.status)} {lead.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge className={`text-xs ${
                  lead.priority === 'high' ? 'bg-red-100 text-red-800' :
                  lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.priority === 'high' && '🔥'} 
                  {lead.priority === 'medium' && '⚡'} 
                  {lead.priority === 'low' && '📝'} 
                  {lead.priority}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 flex-shrink-0">👤</span>
                  <span className="font-medium truncate">{lead.contactName}</span>
                </div>
                
                {lead.contactEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{lead.contactEmail}</span>
                  </div>
                )}
                
                {lead.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{lead.contactPhone}</span>
                  </div>
                )}
                
                {lead.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{lead.website}</span>
                  </div>
                )}
              </div>

              {/* Business Information */}
              {lead.businessType && (
                <Badge variant="outline" className="text-xs">
                  {lead.businessType.replace('_', ' ')}
                </Badge>
              )}

              {/* Timeline Information */}
              {lead.deadline && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Due: {new Date(lead.deadline).toLocaleDateString()}</span>
                </div>
              )}

              {/* Budget */}
              {lead.budget && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span>${lead.budget.toLocaleString()}</span>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {lead.onboardingFormReceived && (
                  <Badge variant="secondary" className="text-xs">
                    📋 Form Received
                  </Badge>
                )}
                {lead.callLink && (
                  <Badge variant="secondary" className="text-xs">
                    🔗 Call Scheduled
                  </Badge>
                )}
                {lead.buildUrl && (
                  <Badge variant="secondary" className="text-xs">
                    🚀 Build Live
                  </Badge>
                )}
              </div>

              {/* Context Indicator */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {lead.context === 'notrom' ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Building2 className="w-4 h-4" />
                    <span>Notrom Business</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Briefcase className="w-4 h-4" />
                    <span>Day Job</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}