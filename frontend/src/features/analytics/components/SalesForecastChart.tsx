import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { generateForecast } from "../data/mockForecastData";
import type { ForecastDuration } from "../data/types";

const durations: ForecastDuration[] = [7, 14, 30];

const chartConfig = {
  revenue: { label: "Actual Revenue", color: "hsl(var(--primary))" },
  predictedRevenue: { label: "Forecast", color: "hsl(var(--info))" },
};

export function SalesForecastChart() {
  const [duration, setDuration] = useState<ForecastDuration>(14);

  const data = useMemo(() => generateForecast(duration), [duration]);

  // Find the boundary index (last point with actual revenue)
  let boundaryIdx = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].revenue !== undefined) { boundaryIdx = i; break; }
  }
  const boundaryDate = data[boundaryIdx]?.date ?? "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Sales Forecast</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Historical trend with {duration}-day projection
          </p>
        </div>
        <div className="flex gap-1">
          {durations.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={duration === d ? "default" : "outline"}
              className="h-7 text-xs px-3"
              onClick={() => setDuration(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <ReferenceLine
              x={boundaryDate}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: "Today", fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            {/* Actual revenue — solid line */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fill="url(#actualGrad)"
              strokeWidth={2}
              connectNulls={false}
              animationDuration={800}
              dot={false}
            />
            {/* Forecast — dashed line */}
            <Area
              type="monotone"
              dataKey="predictedRevenue"
              stroke="hsl(var(--info))"
              fill="url(#forecastGrad)"
              strokeWidth={2}
              strokeDasharray="6 3"
              connectNulls={false}
              animationDuration={800}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
