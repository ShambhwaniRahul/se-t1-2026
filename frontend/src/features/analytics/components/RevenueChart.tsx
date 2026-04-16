import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { HISTORICAL_REVENUE } from "../data/mockRevenueData";
import type { DateRange } from "../data/types";

interface RevenueChartProps {
  range: DateRange;
}

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  orders: { label: "Orders", color: "hsl(var(--info))" },
};

export function RevenueChart({ range }: RevenueChartProps) {
  const data = useMemo(() => {
    const sliceMap: Record<string, number> = { today: 1, week: 7, month: 30, custom: 60 };
    const count = sliceMap[range] || 30;
    return HISTORICAL_REVENUE.slice(-count).map((d) => ({
      ...d,
      label: d.date.slice(5), // MM-DD
    }));
  }, [range]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Revenue over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="url(#revGrad)"
                strokeWidth={2}
                animationDuration={800}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Orders vs Revenue dual axis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Orders vs Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar yAxisId="right" dataKey="orders" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
