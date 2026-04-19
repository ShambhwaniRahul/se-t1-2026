import { useEffect, useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { CategoryChart } from "@/features/dashboard/components/CategoryChart";
import { TopItemsList } from "@/features/dashboard/components/TopItemsList";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import api from "@/lib/api";
import {
  type RevenueKPIs,
  type ActiveTables,
  type RevenueTrend,
  type SalesByCategory,
  type TopSellingItems,
  type RecentOrders,
} from "@/features/dashboard/data/dashboardData";
import { DollarSign, ShoppingCart, Receipt, UtensilsCrossed } from "lucide-react";

export default function DashboardPage() {
  const [revenueKPIs, setRevenueKPIs] = useState<RevenueKPIs | null>(null);
  const [revenueKPIsYesterday, setRevenueKPIsYesterday] = useState<RevenueKPIs | null>(null);
  const [activeTables, setActiveTables] = useState<ActiveTables | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<SalesByCategory[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItems[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrders[]>([]);
  
  useEffect(() => {
    fetchRevenueKPIs();
    fetchActiveTables();
    fetchRevenueTrend();
    fetchSalesByCategory();
    fetchTopItems();
    fetchRecentOrders();
  }, []);

  const fetchRevenueKPIs = async () => {
    try {
        const result = await api.get("/analytics/revenue-kpis?start_date=2026-04-19&end_date=2026-04-19");
        const resultYesterday = await api.get("/analytics/revenue-kpis?start_date=2026-04-18&end_date=2026-04-18");
        if (result.data.success) {
            setRevenueKPIs(result.data.data);
        }
        if (resultYesterday.data.success) {
            setRevenueKPIsYesterday(resultYesterday.data.data);
        }
    } catch (err) {
        console.error("Failed to fetch revenue KPIs", err);
    }
  }

  const fetchActiveTables = async () => {
    try {
        const result = await api.get("/analytics/active-tables/");
        if (result.data.success) {
            setActiveTables(result.data.data);
        }
    } catch (err) {
        console.error("Failed to fetch active tables", err);
    }
  }

  const fetchRevenueTrend = async () => {
    try {
        const result = await api.get("/analytics/revenue-by-date?start_date=2026-04-01&end_date=2026-04-14");
        if (result.data.success) {
            setRevenueTrend(result.data.data);
        }
    } catch (err) {
        console.error("Failed to fetch revenue trend", err);
    }
  }

  const fetchSalesByCategory = async () => {
    try {
        const result = await api.get("/analytics/sales-by-category?start_date=2026-04-01&end_date=2026-04-14");
        if (result.data.success) {
            setCategoryBreakdown(result.data.data);
        }
    } catch (err) {
        console.error("Failed to fetch sales by category", err);
    }
  }

  const fetchTopItems = async () => {
    try {
        const result = await api.get("/analytics/top-selling-items?start_date=2026-04-01&end_date=2026-04-14");
        if (result.data.success) {
            setTopItems(result.data.data);
        }
        console.log("Fetched top selling items", result.data.data);
    } catch (err) {
        console.error("Failed to fetch top selling items", err);
    }
  };

  const fetchRecentOrders = async () => {
    try {
        const result = await api.get("/analytics/recent-orders");
        if (result.data.success) {
            setRecentOrders(result.data.data);
        }
    } catch (err) {
        console.error("Failed to fetch recent orders", err);
    }
  };

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
          value={`$${revenueKPIs?.total_revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: revenueKPIsYesterday?.total_revenue ? (revenueKPIs?.total_revenue / revenueKPIsYesterday?.total_revenue - 1) * 100 : 0, label: "vs yesterday" }}
        />
        <StatsCard
          title="Orders Today"
          value={revenueKPIs?.total_orders}
          icon={ShoppingCart}
          trend={{ value: revenueKPIsYesterday?.total_orders ? (revenueKPIs?.total_orders / revenueKPIsYesterday?.total_orders - 1) * 100 : 0, label: "vs yesterday" }}
        />
        <StatsCard
          title="Avg Ticket"
          value={`$${revenueKPIs?.average_revenue_per_order.toFixed(2)}`}
          icon={Receipt}
          trend={{ value: revenueKPIsYesterday?.average_revenue_per_order ? (revenueKPIs?.average_revenue_per_order / revenueKPIsYesterday?.average_revenue_per_order - 1) * 100 : 0, label: "vs yesterday" }}
        />
        <StatsCard
          title="Active Tables"
          value={`${activeTables?.active_tables} / ${activeTables?.total_tables}`}
          icon={UtensilsCrossed}
          description={`${Math.round((activeTables?.active_tables / activeTables?.total_tables) * 100)}% occupancy`}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueTrend} />
        </div>
        <CategoryChart data={categoryBreakdown} />
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopItemsList items={topItems} />
        <ActivityFeed items={recentOrders} />
      </div>
    </PageLayout>
  );
}
