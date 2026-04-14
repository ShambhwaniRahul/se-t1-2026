import { DollarSign, ShoppingCart, TrendingUp, Users, Clock, Package } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { KPI_DATA } from "../data/mockRevenueData";
import type { DateRange } from "../data/types";

interface KPIGridProps {
  range: DateRange;
}

export function KPIGrid({ range }: KPIGridProps) {
  const key = range === "custom" ? "month" : range;
  const d = KPI_DATA[key];
  const t = KPI_DATA.trends;

  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatsCard
        title="Total Revenue"
        value={fmt(d.revenue)}
        icon={DollarSign}
        trend={{ value: t.revenue, label: "vs last period" }}
      />
      <StatsCard
        title="Total Orders"
        value={d.orders.toLocaleString()}
        icon={ShoppingCart}
        trend={{ value: t.orders, label: "vs last period" }}
      />
      <StatsCard
        title="Avg Order Value"
        value={`$${d.aov.toFixed(2)}`}
        icon={TrendingUp}
        trend={{ value: t.aov, label: "vs last period" }}
      />
      <StatsCard
        title="Retention Rate"
        value={`${d.retention}%`}
        icon={Users}
        trend={{ value: t.retention, label: "vs last period" }}
      />
      <StatsCard
        title="Table Turnover"
        value={`${d.tableTurnover}x`}
        icon={Clock}
        trend={{ value: t.tableTurnover, label: "vs last period" }}
      />
      <StatsCard
        title="Inventory Rate"
        value={`${d.inventoryRate}%`}
        icon={Package}
        trend={{ value: t.inventoryRate, label: "vs last period" }}
      />
    </div>
  );
}
