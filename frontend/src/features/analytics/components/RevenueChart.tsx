"use client";

import { useMemo } from "react";
import { Area, ComposedChart, CartesianGrid, XAxis, YAxis, Line, Bar, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Config update: Indigo for EWMA to provide premium contrast
const chartConfig = {
  Revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  EWMA: { label: "Trend (EWMA)", color: "#6366f1" }, 
  orders: { label: "Orders", color: "#f97316" }, 
};

const formatXAxisDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `₹ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹ ${(value / 1000).toFixed(0)}k`;
  return `₹ ${value}`;
};

export function RevenueChart({ revenueData, orderData }: RevenueChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      
      {/* Primary Chart: Revenue and EWMA Projection */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">Revenue & Trend Analysis</CardTitle>
          <CardDescription>Performance tracking with Indigo EWMA trend projection</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs font-medium" 
                  tick={{ fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={formatXAxisDate}
                  tickMargin={10}
                  minTickGap={20}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs font-medium"
                  tick={{ fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={formatCurrency} 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        name === "Revenue" || name === "EWMA" ? formatCurrency(value as number) : value, 
                        chartConfig[name as keyof typeof chartConfig]?.label || name
                      ]}
                    />
                  } 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                  animationDuration={800}
                />
                
                {/* Stylized EWMA Line: Indigo color, dashed pattern, and thicker stroke */}
                <Line
                  type="monotone"
                  dataKey="EWMA"
                  name="EWMA"
                  stroke={chartConfig.EWMA.color}
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: chartConfig.EWMA.color, 
                    stroke: "#fff", 
                    strokeWidth: 2 
                  }}
                  animationDuration={800}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Secondary Chart: Orders vs Revenue Grouped Dual-Axis Bar Chart */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">Volume to Revenue Correlation</CardTitle>
          <CardDescription>Quarterly metrics comparison across dual scales</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={orderData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis 
                  dataKey="start_date" 
                  className="text-xs font-medium" 
                  tick={{ fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={formatXAxisDate}
                  tickMargin={10}
                  minTickGap={20}
                  axisLine={false}
                  tickLine={false}
                />
                
                <YAxis 
                  yAxisId="revenue-axis" 
                  className="text-xs font-medium"
                  tick={{ fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={formatCurrency} 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                
                <YAxis 
                  yAxisId="orders-axis" 
                  orientation="right" 
                  className="text-xs font-medium"
                  tick={{ fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={(value) => value.toLocaleString()}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                
                <ChartTooltip 
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => [
                        name === "total_revenue" ? formatCurrency(value as number) : (value as number).toLocaleString(), 
                        name === "total_revenue" ? "Revenue" : "Orders"
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return `${formatXAxisDate(data.start_date)} - ${formatXAxisDate(data.end_date)}`;
                        }
                        return formatXAxisDate(label);
                      }}
                    />
                  } 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                
                <Bar 
                  yAxisId="revenue-axis" 
                  dataKey="total_revenue" 
                  name="total_revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={800} 
                />

                <Bar 
                  yAxisId="orders-axis" 
                  dataKey="total_orders" 
                  name="total_orders" 
                  fill={chartConfig.orders.color} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={800} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}