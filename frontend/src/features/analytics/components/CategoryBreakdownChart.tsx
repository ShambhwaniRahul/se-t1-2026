import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CATEGORY_REVENUE } from "../data/mockRevenueData";

const chartConfig = Object.fromEntries(
  CATEGORY_REVENUE.map((c) => [c.category, { label: c.category, color: c.fill }])
);

export function CategoryBreakdownChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[400px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={CATEGORY_REVENUE}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              strokeWidth={2}
              stroke="hsl(var(--background))"
              animationDuration={800}
            >
              {CATEGORY_REVENUE.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
