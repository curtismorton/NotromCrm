import { Link } from "wouter";
import { LeadTable } from "@/components/modules/leads/LeadTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function LeadsPage() {
  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <div className="flex mt-3 space-x-3 sm:mt-0">
            <Button asChild>
              <Link href="/leads/new">
                <PlusCircle className="w-5 h-5 mr-2" />
                New Lead
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <LeadTable />
        </div>
      </div>
    </div>
  );
}
