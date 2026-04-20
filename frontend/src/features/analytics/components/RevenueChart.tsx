import { useMemo } from "react";
import { Area, ComposedChart, CartesianGrid, XAxis, YAxis, Line, Bar, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export interface RevenueOverTime {
  index: number;
  date: string;
  Revenue: number;
  EWMA: number;
}

export interface OrderVersusRevenue {
  index: number;
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_orders: number;
}

interface RevenueChartProps {
  revenueData: RevenueOverTime[];
  orderData: OrderVersusRevenue[];
}

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  ewma: { label: "Trend (EWMA)", color: "hsl(var(--destructive))" },
  orders: { label: "Orders", color: "#f97316" }, 
};

/**
 * Formats standard ISO date strings into condensed month-year ticks.
 */
const formatXAxisDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

/**
 * Condenses large currency values into readable abbreviations.
 */
const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

export function RevenueChart({ revenueData, orderData }: RevenueChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      
      {/* Primary Chart: Revenue and EWMA Projection */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">Revenue & Trend Analysis</CardTitle>
          <CardDescription>Monthly revenue tracking against Exponentially Weighted Moving Average</CardDescription>
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
                
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#revGrad)"
                  strokeWidth={2}
                  animationDuration={800}
                />
                
                <Line
                  type="monotone"
                  dataKey="EWMA"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
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
          <CardDescription>Order volume mapped against total generated revenue per period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* Added barGap=2 to bring the dual bars physically closer together */}
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
                
                {/* Financial metric axis (Left) */}
                <YAxis 
                  yAxisId="revenue-axis" 
                  className="text-xs font-medium"
                  tick={{ fill: "hsl(var(--muted-foreground))" }} 
                  tickFormatter={formatCurrency} 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                
                {/* Volume metric axis (Right) */}
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
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
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
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                
                {/* Revenue represented as a bar bound to the left Y-axis */}
                <Bar 
                  yAxisId="revenue-axis" 
                  dataKey="total_revenue" 
                  name="total_revenue" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={800} 
                />

                {/* Orders represented as a bar bound to the right Y-axis */}
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