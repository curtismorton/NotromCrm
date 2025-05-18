import { Link } from "wouter";
import { ProjectTable } from "@/components/modules/projects/ProjectTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <div className="flex mt-3 space-x-3 sm:mt-0">
            <Button asChild>
              <Link href="/projects/new">
                <PlusCircle className="w-5 h-5 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <ProjectTable />
        </div>
      </div>
    </div>
  );
}
