import { useState, useEffect, use } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { KPIGrid } from "../components/KPIGrid";
import { RevenueChart } from "../components/RevenueChart";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart";
import { SalesForecastChart } from "../components/SalesForecastChart";
import { OperationalInsights } from "../components/OperationalInsights";
import type { RevenueKPIs, RevenueOverTime, OrderVersusRevenue, SalesByCategory, PerformingItems, SalesForecasting, RevenueTrend } from "../data/types";
import api from "@/lib/api";
import { toast } from "sonner";
import { ScanSearch } from "lucide-react";

// Sequential messages displayed during the data fetching & AI forecasting phase
const PROCESSING_STEPS = [
  "Aggregating revenue KPIs...",
  "Analyzing historical trends...",
  "Running AI sales forecasting...",
  "Compiling operational insights..."
];

export default function KPIAnalyticsPage() {

  const now = new Date();

  // 1) Current date in IST (YYYY-MM-DD)
  const istDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);

  const istTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);


  // 3) N days back date in IST (YYYY-MM-DD)
  const yesterday = new Date(now);
  const oneMonthBack = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  oneMonthBack.setDate(oneMonthBack.getDate() - 30);

  const istYesterday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(yesterday);

  const istOneMonthBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(oneMonthBack);

  const [kpiData, setKPIData] = useState<RevenueKPIs | []>([]);
  const [revenueOverTime, setRevenueOverTime] = useState<RevenueOverTime[] | []>([]);
  const [monthRevenue, setMonthRevenue] = useState<RevenueOverTime[] | []>([]);
  const [orderVersusRevenue, setOrderVersusRevenue] = useState<OrderVersusRevenue[] | []>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[] | []>([]);
  const [topPerformingItems, setTopPerformingItems] = useState<PerformingItems[] | []>([]);
  const [leastPerformingItems, setLeastPerformingItems] = useState<PerformingItems[] | []>([]);
  const [salesForecasting, setSalesForecasting] = useState<SalesForecasting[] | []>([]);

  // States for handling the extended AI processing UI
  const [isProcessing, setIsProcessing] = useState(true);
  const [processStep, setProcessStep] = useState(0);

  // Cycles through processing messages every 2.5 seconds while isProcessing is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setProcessStep(0);
      interval = setInterval(() => {
        setProcessStep((prev) => 
          prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    const loadAllAnalyticsData = async () => {
      setIsProcessing(true);
      await Promise.all([
        fetchRevenueKPIs(),
        fetchRevenueOverTime(),
        fetchOrderVersusRevenue(),
        fetchSalesByCategory(),
        fetchPerformingItems(),
        fetchSalesForecasting(),
        fetchMonthRevenue()
      ]);
      setIsProcessing(false);
    };

    loadAllAnalyticsData();
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

  const fetchSalesForecasting = async () => {
    try {
      const result = await api.get(`/analytics/sales-forecast?end_date=${istYesterday}`)
      setSalesForecasting(result.data.data);
    } catch (err) {
      console.error("Failed to fetch sales forecasting", err);
    }
  }

  const fetchMonthRevenue = async () => {
    try {
      const result = await api.get(`/analytics/revenue-over-time?start_date=${istOneMonthBack}&end_date=${istDate}&end_time=${istTime}&span=1`)
      setMonthRevenue(result.data.data.ewma_trendline);
    } catch (err) {
        console.error("Failed to fetch month revenue", err);
    }
  }

  return (
    <PageLayout>
      {/* Full-screen blocking overlay active during data fetch and AI forecasting */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Data</h3>
            <p className="text-sm text-muted-foreground animate-pulse h-6">
              {PROCESSING_STEPS[processStep]}
            </p>
          </div>
        </div>
      )}

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
      <SalesForecastChart prevData={monthRevenue} salesForecast={salesForecasting} />

      {/* Operational Insights */}
      <OperationalInsights topItems={topPerformingItems} leastItems={leastPerformingItems} />
    </PageLayout>
  );
}