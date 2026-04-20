import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Clock } from "lucide-react";
import { PEAK_HOURS, TOP_ITEMS, LOW_ITEMS, STAFF_EFFICIENCY } from "../data/mockRevenueData";
import type { PerformingItems } from "../data/types";

import { cn } from "@/lib/utils";

interface OperationalInsightsProps {
  topItems: PerformingItems[];
  leastItems: PerformingItems[];
}

export function OperationalInsights({ topItems, leastItems }: OperationalInsightsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      
      {/* Top Performing Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" /> Top Performing Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.sales_count} orders</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">₹ {item.total_revenue}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Low Performing Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" /> Low Performing Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leastItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.sales_count} orders</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">₹ {item.total_revenue}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
