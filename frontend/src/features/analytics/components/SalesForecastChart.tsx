"use client";

import { useMemo, useState } from "react";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  ReferenceLine, 
  ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface RevenueOverTime {
  index: number;
  date: string;
  Revenue: number;
  EWMA: number;
}

export interface SalesForecasting {
  date: string;
  holt_winters_forecast: number;
  sarima_forecast: number;
}

const chartConfig = {
  revenue: { label: "Actual Revenue", color: "#2563eb" }, 
  ewma: { label: "EWMA Trend", color: "#000000" }, 
  sarima: { label: "SARIMA Forecast", color: "#f59e0b" }, 
  holtWinters: { label: "Holt-Winters Forecast", color: "#10b981" } 
};

interface SalesForecastChartProps {
  prevData: RevenueOverTime[] | any[]; 
  salesForecast: SalesForecasting[];
}

export function SalesForecastChart({ prevData, salesForecast }: SalesForecastChartProps) {
  const [showEwma, setShowEwma] = useState<boolean>(true);
  const [showSarima, setShowSarima] = useState<boolean>(true);
  const [showHoltWinters, setShowHoltWinters] = useState<boolean>(true);

  const { combinedData, boundaryDate } = useMemo(() => {
    if (!prevData.length) return { combinedData: [], boundaryDate: "" };

    const historical = prevData.map((d) => ({
      date: d.date,
      revenue: d.Revenue !== undefined ? d.Revenue : d.total_revenue,
      ewma: d.EWMA || null,
      sarima: null,
      holtWinters: null,
    }));

    const forecast = salesForecast.map((f) => ({
      date: f.date,
      revenue: null,
      ewma: null,
      sarima: f.sarima_forecast,
      holtWinters: f.holt_winters_forecast,
    }));

    if (historical.length > 0 && forecast.length > 0) {
      const lastIdx = historical.length - 1;
      historical[lastIdx].sarima = historical[lastIdx].revenue;
      historical[lastIdx].holtWinters = historical[lastIdx].revenue;
    }

    const lastActualDate = historical[historical.length - 1]?.date || "";

    return {
      combinedData: [...historical, ...forecast],
      boundaryDate: lastActualDate,
    };
  }, [prevData, salesForecast]);

  return (
    <Card className="shadow-sm border-border overflow-visible">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight">Sales Forecast</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Historical projection models comparison
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border/50">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80">
            <input 
              type="checkbox" 
              checked={showEwma} 
              onChange={(e) => setShowEwma(e.target.checked)}
              className="accent-[#8b5cf6] w-4 h-4 cursor-pointer"
            />
            <span style={{ color: chartConfig.ewma.color }}>EWMA</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80">
            <input 
              type="checkbox" 
              checked={showSarima} 
              onChange={(e) => setShowSarima(e.target.checked)}
              className="accent-[#f59e0b] w-4 h-4 cursor-pointer"
            />
            <span style={{ color: chartConfig.sarima.color }}>SARIMA</span>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-opacity hover:opacity-80">
            <input 
              type="checkbox" 
              checked={showHoltWinters} 
              onChange={(e) => setShowHoltWinters(e.target.checked)}
              className="accent-[#10b981] w-4 h-4 cursor-pointer"
            />
            <span style={{ color: chartConfig.holtWinters.color }}>Holt-Winters</span>
          </label>
        </div>
      </CardHeader>
      
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ewmaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ewma)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-ewma)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="sarimaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sarima)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-sarima)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="holtWintersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-holtWinters)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-holtWinters)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              
              <XAxis
                dataKey="date"
                className="text-xs font-medium"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => {
                  const date = new Date(v);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
              />
              
              <YAxis
                className="text-xs font-medium"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v) => `₹ ${(v / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />

              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [
                      `₹ ${(Math.round(Number(value)).toLocaleString())} `, 
                      chartConfig[name as keyof typeof chartConfig]?.label || name
                    ]}
                  />
                } 
              />
              
              <Legend verticalAlign="top" height={36} iconType="circle" />
              
              <ReferenceLine
                x={boundaryDate}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ 
                  value: "TODAY", 
                  position: "top", 
                  fill: "#ef4444", 
                  fontSize: 12,
                  fontWeight: "bold",
                  offset: 15
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="url(#actualGrad)"
                strokeWidth={3}
                connectNulls={false}
                animationDuration={800}
                dot={false}
                activeDot={{ r: 6, fill: "var(--color-revenue)" }}
              />

              {showEwma && (
                <Area
                  type="monotone"
                  dataKey="ewma"
                  stroke="var(--color-ewma)"
                  fill="url(#ewmaGrad)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  connectNulls={false}
                  animationDuration={800}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--color-ewma)" }}
                />
              )}

              {showSarima && (
                <Area
                  type="monotone"
                  dataKey="sarima"
                  stroke="var(--color-sarima)"
                  fill="url(#sarimaGrad)"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  connectNulls={false}
                  animationDuration={800}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--color-sarima)" }}
                />
              )}

              {showHoltWinters && (
                <Area
                  type="monotone"
                  dataKey="holtWinters"
                  stroke="var(--color-holtWinters)"
                  fill="url(#holtWintersGrad)"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  connectNulls={false}
                  animationDuration={800}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--color-holtWinters)" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}