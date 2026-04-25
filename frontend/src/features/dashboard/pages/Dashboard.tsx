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
import { ShoppingCart, UtensilsCrossed, IndianRupee, ScanSearch } from "lucide-react";

export default function DashboardPage() {
  const [revenueKPIs, setRevenueKPIs] = useState<RevenueKPIs | null>(null);
  const [revenueKPIsYesterday, setRevenueKPIsYesterday] = useState<RevenueKPIs | null>(null);
  const [activeTables, setActiveTables] = useState<ActiveTables | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<SalesByCategory[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItems[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrders[]>([]);

  // State for handling the static AI processing UI
  const [isProcessing, setIsProcessing] = useState(true);

  const now = new Date();

  // 1) Current date in IST (YYYY-MM-DD)
  const istDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
  }).format(now);

  // 2) Current time in IST (HH:MM:SS)
  const istTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  // 3) N days back date in IST (YYYY-MM-DD)
  const yesterday = new Date(now);
  const twoWeeksBack = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  twoWeeksBack.setDate(twoWeeksBack.getDate() - 14);

  const istYesterday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
  }).format(yesterday);

  const istTwoWeeksBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
  }).format(twoWeeksBack);

  console.log(">>> DATES: ", istDate, istTime, istYesterday, istTwoWeeksBack)

  useEffect(() => {
    const fetchAllData = async () => {
      setIsProcessing(true);
      await Promise.all([
        fetchRevenueKPIs(),
        fetchActiveTables(),
        fetchRevenueTrend(),
        fetchSalesByCategory(),
        fetchTopItems(),
        fetchRecentOrders()
      ]);
      setIsProcessing(false);
    };

    fetchAllData();
  }, []);

  const fetchRevenueKPIs = async () => {
    try {
      const result = await api.get(`/analytics/revenue-kpis?start_date=${istDate}&end_date=${istDate}&end_time=${istTime}`);
      const resultYesterday = await api.get(`/analytics/revenue-kpis?start_date=${istYesterday}&end_date=${istYesterday}&end_time=${istTime}`);
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
      const result = await api.get(`/analytics/revenue-by-date?start_date=${istTwoWeeksBack}&end_date=${istDate}`);
      if (result.data.success) {
        setRevenueTrend(result.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch revenue trend", err);
    }
  }

  const fetchSalesByCategory = async () => {
    try {
      const result = await api.get(`/analytics/sales-by-category?start_date=${istDate}&end_date=${istDate}`);
      if (result.data.success) {
        setCategoryBreakdown(result.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sales by category", err);
    }
  }

  const fetchTopItems = async () => {
    try {
      const result = await api.get(`/analytics/top-selling-items?start_date=${istDate}&end_date=${istDate}`);
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
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="sticky top-0 h-[calc(100vh-8rem)] flex items-center justify-center">
            <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
              <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
              <h3 className="text-xl font-semibold mb-2">Loading Dashboard</h3>
              <p className="text-sm text-muted-foreground animate-pulse h-6">
                Analyzing insights
              </p>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description={`Today's snapshot — ${Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now)} ${Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now)} IST`}
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Revenue"
          value={`₹ ${revenueKPIs?.total_revenue?.toLocaleString() || 0}`}
          icon={IndianRupee}
          trend={{ value: (revenueKPIs?.total_revenue / revenueKPIsYesterday?.total_revenue - 1) * 100, label: "vs yesterday" }}
        />
        <StatsCard
          title="Orders Today"
          value={revenueKPIs?.total_orders || 0}
          icon={ShoppingCart}
          trend={{ value: (revenueKPIs?.total_orders / revenueKPIsYesterday?.total_orders - 1) * 100, label: "vs yesterday" }}
        />
        <StatsCard
          title="Avg Ticket"
          value={`₹ ${revenueKPIs?.average_revenue_per_order?.toFixed(0) || 0}`}
          icon={IndianRupee}
          trend={{ value: (revenueKPIs?.average_revenue_per_order / revenueKPIsYesterday?.average_revenue_per_order - 1) * 100, label: "vs yesterday" }}
        />
        <StatsCard
          title="Active Tables"
          value={`${activeTables?.active_tables || 0} / ${activeTables?.total_tables || 0}`}
          icon={UtensilsCrossed}
          description={`${Math.round(((activeTables?.active_tables || 0) / (activeTables?.total_tables || 1)) * 100)}% occupancy`}
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