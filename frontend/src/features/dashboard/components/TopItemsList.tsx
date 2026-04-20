import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopSellingItems } from "../data/dashboardData";

interface TopItemsListProps {
  items: TopSellingItems[];
}

export function TopItemsList({ items }: TopItemsListProps) {
  const maxQty = Math.max(...items.map((i) => i.sales_count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Top Selling Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground tabular-nums w-4">{idx + 1}.</span>
                <span className="font-medium">{item.name}</span>
              </span>
              <span className="text-muted-foreground tabular-nums text-xs">
                {item.sales_count} sold · ₹{item.total_revenue.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(item.sales_count / maxQty) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
