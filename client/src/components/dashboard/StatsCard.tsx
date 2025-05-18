import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  changePercentage?: number;
}

export const StatsCard = ({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-500",
  changePercentage,
}: StatsCardProps) => {
  const isPositiveChange = changePercentage && changePercentage > 0;
  
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 p-3 text-white rounded-md", iconBgColor)}>
            {icon}
          </div>
          <div className="flex-1 w-0 ml-5">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <div className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {changePercentage !== undefined && (
                <div className={cn(
                  "flex items-baseline ml-2 text-sm font-semibold",
                  isPositiveChange ? "text-green-600" : "text-red-600"
                )}>
                  {isPositiveChange ? (
                    <TrendingUp className="w-4 h-4 self-center flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 self-center flex-shrink-0" />
                  )}
                  <span className="ml-1">{Math.abs(changePercentage)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
