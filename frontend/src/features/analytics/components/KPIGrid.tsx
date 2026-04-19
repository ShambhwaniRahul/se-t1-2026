import { DollarSign, ShoppingCart, TrendingUp, Users, Clock, Package } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { KPI_DATA } from "../data/mockRevenueData";
import type { DateRange, RevenueKPIs } from "../data/types";

interface KPIGridProps {
  range: DateRange;
}

export function KPIGrid({ range, currentData, prevData }: KPIGridProps & { currentData: RevenueKPIs | null; prevData: RevenueKPIs | null }) {
  const fmt = (v: number) =>
    v >= 1000000 ? `$${(v / 100000).toFixed(1)}L` : v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatsCard
        title="Total Revenue"
        value={fmt(currentData?.total_revenue || 0)}
        icon={DollarSign}
        trend={{ value: (currentData?.total_revenue / prevData?.total_revenue - 1) * 100, label: `vs last ${range}` }}
      />
      <StatsCard
        title="Total Orders"
        value={(currentData?.total_orders || 0)}
        icon={ShoppingCart}
        trend={{ value: (currentData?.total_orders / prevData?.total_orders - 1) * 100, label: `vs last ${range}` }}
      />
      <StatsCard
        title="Avg Order Value"
        value={fmt(currentData?.average_revenue_per_order || 0)}
        icon={DollarSign}
        trend={{ value: (currentData?.average_revenue_per_order / prevData?.average_revenue_per_order - 1) * 100, label: `vs last ${range}` }}
      />
    </div>
  );
}
