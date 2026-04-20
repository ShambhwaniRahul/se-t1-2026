import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Clock } from "lucide-react";
import { PEAK_HOURS, TOP_ITEMS, LOW_ITEMS, STAFF_EFFICIENCY } from "../data/mockRevenueData";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export function OperationalInsights() {
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
          {TOP_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.orders} orders</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${item.revenue.toLocaleString()}</p>
                <Badge variant="secondary" className="text-[10px] text-success">
                  +{item.trend}%
                </Badge>
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
          {LOW_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.orders} orders</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${item.revenue.toLocaleString()}</p>
                <Badge variant="secondary" className="text-[10px] text-destructive">
                  {item.trend}%
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
