import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, Clock } from "lucide-react";
import { PEAK_HOURS, TOP_ITEMS, LOW_ITEMS, STAFF_EFFICIENCY } from "../data/mockRevenueData";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function intensityClass(v: number) {
  if (v >= 9) return "bg-primary text-primary-foreground";
  if (v >= 7) return "bg-primary/70 text-primary-foreground";
  if (v >= 5) return "bg-primary/40 text-primary-foreground";
  if (v >= 3) return "bg-primary/20 text-foreground";
  return "bg-muted text-muted-foreground";
}

export function OperationalInsights() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Peak Hours Heatmap */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Peak Hours Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="py-1 text-left text-muted-foreground font-medium w-16">Hour</th>
                  {DAYS.map((d) => (
                    <th key={d} className="py-1 text-center text-muted-foreground font-medium">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PEAK_HOURS.map((row) => (
                  <tr key={row.hour}>
                    <td className="py-1 text-muted-foreground font-medium">{row.hour}</td>
                    {dayKeys.map((day) => (
                      <td key={day} className="p-0.5 text-center">
                        <div className={cn("rounded-md py-1.5 text-[11px] font-medium", intensityClass(row[day]))}>
                          {row[day]}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

      {/* Staff Efficiency */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Staff Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STAFF_EFFICIENCY.map((s) => (
              <div key={s.name} className="rounded-lg border p-3 space-y-1">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-warning" />{s.rating}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{s.avgTime}m avg</span>
                </div>
                <p className="text-lg font-bold">{s.ordersHandled}</p>
                <p className="text-[11px] text-muted-foreground">orders handled</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
