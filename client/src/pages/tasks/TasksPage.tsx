import { Link } from "wouter";
import { TaskTable } from "@/components/modules/tasks/TaskTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function TasksPage() {
  return (
    <div>
      <div className="pb-4 mb-6 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <div className="flex mt-3 space-x-3 sm:mt-0">
            <Button asChild>
              <Link href="/tasks/new">
                <PlusCircle className="w-5 h-5 mr-2" />
                New Task
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <TaskTable />
        </div>
      </div>
    </div>
  );
}
