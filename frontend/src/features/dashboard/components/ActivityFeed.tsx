import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { RecentOrders } from "../data/dashboardData";

interface ActivityFeedProps {
  items: RecentOrders[];
}

const STATUS_STYLES: Record<RecentOrders["status"], string> = {
  Open: "bg-info/15 text-info",
  Closed: "bg-success/15 text-success",
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[340px]">
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.order_id} className="flex items-center gap-3 px-6 py-3">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
                    STATUS_STYLES[item.status]
                  )}
                >
                  {item.status}
                </span>
                <span className="flex-1 truncate text-sm">{item.dining_type}</span>
                <span className="shrink-0 text-right">
                  
                    <span
                      className={cn(
                        "block text-sm font-medium tabular-nums", "text-foreground"
                      )}
                    >
                      +${Math.abs(item.total_amount).toFixed(2)}
                    </span>
                  <span className="text-[11px] text-muted-foreground">{item.timedelta_since_order} minutes ago</span>
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
