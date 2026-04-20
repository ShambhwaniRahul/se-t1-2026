import { useState, useEffect, use } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { KPIGrid } from "../components/KPIGrid";
import { RevenueChart } from "../components/RevenueChart";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart";
import { SalesForecastChart } from "../components/SalesForecastChart";
import { OperationalInsights } from "../components/OperationalInsights";
import type { RevenueKPIs, RevenueOverTime, OrderVersusRevenue, SalesByCategory, PerformingItems } from "../data/types";
import api from "@/lib/api";
import { toast } from "sonner";

export default function KPIAnalyticsPage() {
  const [kpiData, setKPIData] = useState<RevenueKPIs | []>([]);
  const [revenueOverTime, setRevenueOverTime] = useState<RevenueOverTime[] | []>([]);
  const [orderVersusRevenue, setOrderVersusRevenue] = useState<OrderVersusRevenue[] | []>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[] | []>([]);
  const [topPerformingItems, setTopPerformingItems] = useState<PerformingItems[] | []>([]);
  const [leastPerformingItems, setLeastPerformingItems] = useState<PerformingItems[] | []>([]);

  useEffect(() => {
    fetchRevenueKPIs();
    fetchRevenueOverTime();
    fetchOrderVersusRevenue();
    fetchSalesByCategory();
    fetchPerformingItems();
  }, []);

  const fetchRevenueKPIs = async () => {
    try {
      const result = await api.get("/analytics/revenue-kpis")
      setKPIData(result.data.data);
    } catch (err) {
        console.error("Failed to fetch revenue KPIs", err);
    }
  }
  
  const fetchRevenueOverTime = async () => {
    try {
      const result = await api.get("/analytics/revenue-over-time")
      setRevenueOverTime(result.data.data.ewma_trendline);
    } catch (err) {
        console.error("Failed to fetch revenue over time", err);
    }
  }

  const fetchOrderVersusRevenue = async () => {
    try {
      const result = await api.get("/analytics/order-versus-revenue")
      setOrderVersusRevenue(result.data.data);
    } catch (err) {
        console.error("Failed to fetch order vs revenue", err);
    }
  }

  const fetchSalesByCategory = async () => {
    try {
      const result = await api.get("/analytics/sales-by-category")
      setSalesByCategory(result.data.data);
    } catch (err) {   
        console.error("Failed to fetch sales by category", err);
    }
  }

  const fetchPerformingItems = async () => {
    try {
      const topResult = await api.get("/analytics/top-selling-items/")
      const leastResult = await api.get("/analytics/least-selling-items/")
      setTopPerformingItems(topResult.data.data);
      setLeastPerformingItems(leastResult.data.data);
    } catch (err) {
        console.error("Failed to fetch performing items", err);
    }
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Analytics" description="Business intelligence & performance insights" />
        <div className="flex gap-1">

        </div>
      </div>

      {/* KPI Summary */}
      <KPIGrid kpiData={kpiData} />

      {/* Revenue Analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart revenueData={revenueOverTime} orderData={orderVersusRevenue} />
        </div>
        <CategoryBreakdownChart data={salesByCategory} />
      </div>

      {/* Sales Forecasting */}
      <SalesForecastChart />

      {/* Operational Insights */}
      <OperationalInsights topItems={topPerformingItems} leastItems={leastPerformingItems} />
    </PageLayout>
  );
}
