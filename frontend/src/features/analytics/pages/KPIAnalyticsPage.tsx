import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { KPIGrid } from "../components/KPIGrid";
import { RevenueChart } from "../components/RevenueChart";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart";
import { SalesForecastChart } from "../components/SalesForecastChart";
import { OperationalInsights } from "../components/OperationalInsights";
import type { DateRange } from "../data/types";

const ranges: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "All", value: "custom" },
];

export default function KPIAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("month");

  return (
    <PageLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Analytics" description="Business intelligence & performance insights" />
        <div className="flex gap-1">
          {ranges.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={range === r.value ? "default" : "outline"}
              onClick={() => setRange(r.value)}
              className="h-8 text-xs"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <KPIGrid range={range} />

      {/* Revenue Analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart range={range} />
        </div>
        <CategoryBreakdownChart />
      </div>

      {/* Sales Forecasting */}
      <SalesForecastChart />

      {/* Operational Insights */}
      <OperationalInsights />
    </PageLayout>
  );
}
