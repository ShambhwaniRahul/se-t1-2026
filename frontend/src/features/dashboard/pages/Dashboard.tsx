import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { CategoryChart } from "@/features/dashboard/components/CategoryChart";
import { TopItemsList } from "@/features/dashboard/components/TopItemsList";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import {
  DASHBOARD_STATS,
  REVENUE_TREND,
  TOP_ITEMS,
  CATEGORY_BREAKDOWN,
  ACTIVITY_FEED,
} from "@/features/dashboard/data/dashboardData";
import { DollarSign, ShoppingCart, Receipt, UtensilsCrossed } from "lucide-react";

export default function DashboardPage() {
  const s = DASHBOARD_STATS;

  return (
    <PageLayout>
      <PageHeader
        title="Dashboard"
        description="Today's snapshot — Mar 14, 2026"
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Revenue"
          value={`$${s.todayRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: s.revenueTrend, label: "vs last week" }}
        />
        <StatsCard
          title="Orders Today"
          value={s.ordersToday}
          icon={ShoppingCart}
          trend={{ value: s.ordersTrend, label: "vs last week" }}
        />
        <StatsCard
          title="Avg Ticket"
          value={`$${s.avgTicket.toFixed(2)}`}
          icon={Receipt}
          trend={{ value: s.avgTicketTrend, label: "vs last week" }}
        />
        <StatsCard
          title="Active Tables"
          value={`${s.activeTables} / ${s.totalTables}`}
          icon={UtensilsCrossed}
          description={`${Math.round((s.activeTables / s.totalTables) * 100)}% occupancy`}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={REVENUE_TREND} />
        </div>
        <CategoryChart data={CATEGORY_BREAKDOWN} />
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopItemsList items={TOP_ITEMS} />
        <ActivityFeed items={ACTIVITY_FEED} />
      </div>
    </PageLayout>
  );
}
