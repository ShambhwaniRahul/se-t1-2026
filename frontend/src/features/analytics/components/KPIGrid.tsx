import { DollarSign, ShoppingCart, TrendingUp, Users, Clock, Package, IndianRupee } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import type { RevenueKPIs } from "../data/types";

interface KPIGridProps {
  kpiData: RevenueKPIs | [];
}

export function KPIGrid({ kpiData }: KPIGridProps & { kpiData: RevenueKPIs | null }) {
  const fmt = (v: number) =>
    v >= 1000000 ? `₹ ${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹ ${(v / 1000).toFixed(1)}k` : `₹ ${v.toFixed(0)}`;

  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Revenue"
        value={fmt(kpiData?.total_revenue || 0)}
        icon={IndianRupee}
      />
      <StatsCard
        title="Total Orders"
        value={(kpiData?.total_orders || 0)}
        icon={ShoppingCart}
      />
      <StatsCard
        title="Avg Order Value"
        value={fmt(kpiData?.average_revenue_per_order || 0)}
        icon={IndianRupee}
      />
    </div>
  );
}
