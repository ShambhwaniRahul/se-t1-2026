import { ForecastDuration } from './types';
export interface RevenueKPIs {
  total_revenue: number;
  total_orders: number;
  average_revenue_per_order: number;
}

export interface RevenueOverTime {
  index: number;
  date: string;
  Revenue: number;
  EWMA: number;
}

export interface OrderVersusRevenue {
  date: string;
  index: number;
  total_revenue: number;
  total_orders: number;
}

export interface SalesByCategory {
  category: string;
  total: number;
}

export interface ForecastPoint {
  date: string;
  revenue?: number;
  predictedRevenue: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  fill: string;
}

export interface PerformingItems {
  name: string;
  sales_count: number;
  total_revenue: number;
}

export interface RevenueTrend {
  date: string;
  total_revenue: number;
  total_orders: number;
  average_revenue: number;
}

export interface SalesForecasting {
  date: string;
  holt_winters_forecast: number;
  sarima_forecast: number;
}


export type DateRange = "today" | "week" | "month" | "custom";
export type ForecastDuration = 7 | 14 | 30;
