import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopItem } from "../data/dashboardData";

interface TopItemsListProps {
  items: TopItem[];
}

export function TopItemsList({ items }: TopItemsListProps) {
  const maxQty = Math.max(...items.map((i) => i.quantity));

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
                {item.quantity} sold · ${item.revenue.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(item.quantity / maxQty) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
