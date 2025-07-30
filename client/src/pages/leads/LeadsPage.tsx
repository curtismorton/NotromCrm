import { Link } from "wouter";
import { LeadCardList } from "@/components/modules/leads/LeadCardList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, Briefcase, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Lead } from "@shared/schema";

export default function LeadsPage() {
  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const notromLeads = leads.filter(lead => lead.context === 'notrom');
  const dayJobLeads = leads.filter(lead => lead.context === 'day_job');

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Leads Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track and manage prospects across your business contexts
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/leads/new">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Lead
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">{notromLeads.length}</p>
              <p className="text-sm text-blue-700">Notrom Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{dayJobLeads.length}</p>
              <p className="text-sm text-green-700">Day Job Leads</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-2xl font-bold text-orange-900">
                {leads.filter(l => l.priority === 'high').length}
              </p>
              <p className="text-sm text-orange-700">High Priority</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📞</span>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {leads.filter(l => l.status === 'contacted').length}
              </p>
              <p className="text-sm text-purple-700">Contacted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Lead Views */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">All Leads</span>
            <span className="sm:hidden">All</span>
            <Badge variant="secondary" className="ml-2">
              {leads.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notrom" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Notrom</span>
            <span className="sm:hidden">Notrom</span>
            <Badge variant="secondary" className="ml-2">
              {notromLeads.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="day_job" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Day Job</span>
            <span className="sm:hidden">Day Job</span>
            <Badge variant="secondary" className="ml-2">
              {dayJobLeads.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              📋 <strong>All leads</strong> across both business contexts. Cards are color-coded: 
              <span className="inline-block w-3 h-3 bg-blue-500 rounded ml-1 mr-1"></span> Notrom business, 
              <span className="inline-block w-3 h-3 bg-green-500 rounded ml-1 mr-1"></span> Day job
            </p>
          </div>
          <LeadCardList context="all" />
        </TabsContent>

        <TabsContent value="notrom" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-900">Notrom Business Leads</h4>
                <p className="text-sm text-blue-700">
                  Web development side hustle - client websites, e-commerce, and digital solutions
                </p>
              </div>
            </div>
          </div>
          <LeadCardList context="notrom" />
        </TabsContent>

        <TabsContent value="day_job" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Day Job Leads</h4>
                <p className="text-sm text-green-700">
                  Head of Talent Management at Socially Powerful - recruitment and HR projects
                </p>
              </div>
            </div>
          </div>
          <LeadCardList context="day_job" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
