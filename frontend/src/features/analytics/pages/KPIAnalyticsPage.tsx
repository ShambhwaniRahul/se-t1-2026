import { useState, useEffect, use } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { KPIGrid } from "../components/KPIGrid";
import { RevenueChart } from "../components/RevenueChart";
import { CategoryBreakdownChart } from "../components/CategoryBreakdownChart";
import { SalesForecastChart } from "../components/SalesForecastChart";
import { OperationalInsights } from "../components/OperationalInsights";
import type { DateRange, RevenueKPIs } from "../data/types";
import api from "@/lib/api";

const ranges: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "All", value: "custom" },
];

export default function KPIAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("month");
  const [currentData, setCurrentData] = useState<RevenueKPIs | null>(null);
  const [prevData, setPrevData] = useState<RevenueKPIs | null>(null);
    
  const now = new Date();

  // 1) Current date in IST (YYYY-MM-DD)
  const istDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);

  // 3) N days back date in IST (YYYY-MM-DD)
  const yesterday = new Date(now);
  const twoDaysBack = new Date(now);
  const oneWeekBack = new Date(now);
  const twoWeekBack = new Date(now);
  const oneMonthBack = new Date(now);
  const twoMonthBack = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  twoDaysBack.setDate(twoDaysBack.getDate() - 2);
  oneWeekBack.setDate(oneWeekBack.getDate() - 7);
  twoWeekBack.setDate(twoWeekBack.getDate() - 14);
  oneMonthBack.setDate(oneMonthBack.getDate() - 30);
  twoMonthBack.setDate(twoMonthBack.getDate() - 60);

  const istYesterday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(yesterday);

  const istTwoDaysBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(twoDaysBack);

  const istoneWeekBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(oneWeekBack);

  const istTwoWeekBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(twoWeekBack);

  const istoneMonthBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(oneMonthBack);

  const istTwoMonthBack = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(twoMonthBack);

  useEffect(() => {
    fetchRevenueKPIs(range);
  }, []);

  const fetchRevenueKPIs = async (period: DateRange) => {
    let result = null;
    let resultPrev = null;
    try {
      if(period === "today") {
        result = await api.get(`/analytics/revenue-kpis?start_date=${istDate}&end_date=${istDate}`);
        resultYesterday = await api.get(`/analytics/revenue-kpis?start_date=${istTwoDaysBack}&end_date=${istYesterday}`);
      }
      else if(period === "week") {
        result = await api.get(`/analytics/revenue-kpis?start_date=${istoneWeekBack}&end_date=${istDate}`);
        resultPrev = await api.get(`/analytics/revenue-kpis?start_date=${istTwoWeekBack}&end_date=${istoneWeekBack}`);
      }
      else if(period === "month") {
        result = await api.get(`/analytics/revenue-kpis?start_date=${istoneMonthBack}&end_date=${istDate}`);
        resultPrev = await api.get(`/analytics/revenue-kpis?start_date=${istTwoMonthBack}&end_date=${istoneMonthBack}`);
      }
      else{
        result = await api.get(`/analytics/revenue-kpis/`);
        resultPrev = await api.get(`/analytics/revenue-kpis/`);
      }
      if (result.data.success) {
            setCurrentData(result.data.data);
        }
        if (resultPrev.data.success) {
            setPrevData(resultPrev.data.data);
        }
    } catch (err) {
        console.error("Failed to fetch revenue KPIs", err);
    }
  }

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
      <KPIGrid range={range} currentData={currentData} prevData={prevData} />

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
