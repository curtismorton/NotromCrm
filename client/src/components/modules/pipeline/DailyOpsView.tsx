import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, CheckCircle2, Users, FileText } from "lucide-react";
import { Task, Lead, Delivery } from "@shared/schema";
import { format, isToday, isThisWeek } from "date-fns";

export function DailyOpsView() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: deliveries = [] } = useQuery<Delivery[]>({
    queryKey: ["/api/deliveries"],
  });

  // Filter data for today and this week
  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(new Date(task.dueDate)) && task.status !== 'completed'
  );

  const thisWeekTasks = tasks.filter(task => 
    task.dueDate && isThisWeek(new Date(task.dueDate)) && task.status !== 'completed'
  );

  const thisWeekDeliveries = deliveries.filter(delivery => 
    delivery.deliveryDate && isThisWeek(new Date(delivery.deliveryDate))
  );

  const leadsToFollowUp = leads.filter(lead => 
    lead.status === 'contacted' || lead.status === 'call_booked'
  );

  const outstandingRevisions = leads.filter(lead => 
    lead.status === 'revision_round' || lead.status === 'awaiting_feedback'
  );

  const incompleteOnboardingForms = leads.filter(lead => 
    !lead.onboardingFormReceived && 
    (lead.status === 'onboarding_form_completed' || lead.status === 'build_in_progress')
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {todayTasks.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks due today</p>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-sm truncate">{task.title}</span>
                  <Badge size="sm" variant={
                    task.priority === 'high' ? 'destructive' : 
                    task.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
            {todayTasks.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{todayTasks.length - 5} more tasks
              </p>
            )}
          </CardContent>
        </Card>

        {/* This Week's Deliveries */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">This Week's Deliveries</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {thisWeekDeliveries.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {thisWeekDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deliveries this week</p>
            ) : (
              thisWeekDeliveries.slice(0, 5).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-sm truncate">{delivery.clientName}</span>
                  </div>
                  {delivery.deliveryDate && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(delivery.deliveryDate), 'MMM dd')}
                    </span>
                  )}
                </div>
              ))
            )}
            {thisWeekDeliveries.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{thisWeekDeliveries.length - 5} more deliveries
              </p>
            )}
          </CardContent>
        </Card>

        {/* Leads to Follow Up */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Leads to Follow Up</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {leadsToFollowUp.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {leadsToFollowUp.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads pending follow-up</p>
            ) : (
              leadsToFollowUp.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-blue-500" />
                    <span className="text-sm truncate">{lead.companyName}</span>
                  </div>
                  <Badge size="sm" variant="outline">
                    {lead.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))
            )}
            {leadsToFollowUp.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{leadsToFollowUp.length - 5} more leads
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Outstanding Client Revisions */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Outstanding Client Revisions</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {outstandingRevisions.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstandingRevisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending revisions</p>
            ) : (
              outstandingRevisions.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      <span className="text-sm font-medium">{lead.companyName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                  </div>
                  <div className="text-right">
                    <Badge size="sm" variant={lead.status === 'revision_round' ? 'destructive' : 'default'}>
                      {lead.status.replace(/_/g, ' ')}
                    </Badge>
                    {lead.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(new Date(lead.deadline), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Incomplete Onboarding Forms */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Incomplete Onboarding Forms</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {incompleteOnboardingForms.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {incompleteOnboardingForms.length === 0 ? (
              <p className="text-sm text-muted-foreground">All onboarding forms received</p>
            ) : (
              incompleteOnboardingForms.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-3 w-3 text-red-500" />
                      <span className="text-sm font-medium">{lead.companyName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.contactEmail}</p>
                  </div>
                  <div className="text-right">
                    <Badge size="sm" variant="outline">
                      {lead.status.replace(/_/g, ' ')}
                    </Badge>
                    {lead.deliveryEta && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ETA: {format(new Date(lead.deliveryEta), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* This Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Week Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{thisWeekTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tasks Due</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{thisWeekDeliveries.length}</div>
              <div className="text-sm text-muted-foreground">Deliveries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{leadsToFollowUp.length}</div>
              <div className="text-sm text-muted-foreground">Follow-ups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{outstandingRevisions.length}</div>
              <div className="text-sm text-muted-foreground">Revisions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}