// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
// import { Cell, Pie, PieChart } from "recharts";
// import type { CategoryBreakdown } from "./dashboardData";

// const chartConfig = {
//   Mains: { label: "Mains", color: "hsl(var(--primary))" },
//   Appetizers: { label: "Appetizers", color: "hsl(var(--info))" },
//   Drinks: { label: "Drinks", color: "hsl(var(--success))" },
//   Desserts: { label: "Desserts", color: "hsl(var(--warning))" },
// };

// interface CategoryChartProps {
//   data: CategoryBreakdown[];
// }

// export function CategoryChart({ data }: CategoryChartProps) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-base font-semibold">Sales by Category</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[220px]">
//           <PieChart>
//             <ChartTooltip
//               content={
//                 <ChartTooltipContent
//                   formatter={(value) => <span className="font-mono tabular-nums">{value}%</span>}
//                 />
//               }
//             />
//             <Pie
//               data={data}
//               dataKey="value"
//               nameKey="category"
//               cx="50%"
//               cy="50%"
//               innerRadius={60}
//               outerRadius={90}
//               strokeWidth={2}
//               stroke="hsl(var(--background))"
//             >
//               {data.map((entry) => (
//             <Cell
//                 key={entry.category}
//                 fill={chartConfig[entry.category as keyof typeof chartConfig]?.color}
//             />
//             ))}
//             </Pie>
//           </PieChart>
//         </ChartContainer>
//         <div className="mt-4 grid grid-cols-2 gap-2">
//           {data.map((item) => (
//             <div key={item.category} className="flex items-center gap-2 text-sm">
//               <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />
//               <span className="text-muted-foreground">{item.category}</span>
//               <span className="ml-auto font-medium tabular-nums">{item.value}%</span>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";
import type { CategoryBreakdown } from "../data/dashboardData";

const chartConfig = {
  Mains: { label: "Mains", color: "hsl(var(--chart-1))" },
  Appetizers: { label: "Appetizers", color: "hsl(var(--chart-2))" },
  Drinks: { label: "Drinks", color: "hsl(var(--chart-3))" },
  Desserts: { label: "Desserts", color: "hsl(var(--chart-4))" },
};

interface CategoryChartProps {
  data: CategoryBreakdown[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Sales by Category
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span className="font-mono tabular-nums">{value}%</span>
                  )}
                />
              }
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={
                    chartConfig[
                      entry.category as keyof typeof chartConfig
                    ]?.color
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item) => (
            <div
              key={item.category}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    chartConfig[
                      item.category as keyof typeof chartConfig
                    ]?.color,
                }}
              />
              <span className="text-muted-foreground">
                {item.category}
              </span>
              <span className="ml-auto font-medium tabular-nums">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}