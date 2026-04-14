export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
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

export interface PeakHourData {
  hour: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface PerformingItem {
  name: string;
  orders: number;
  revenue: number;
  trend: number;
}

export interface StaffEfficiency {
  name: string;
  ordersHandled: number;
  avgTime: number;
  rating: number;
}

export type DateRange = "today" | "week" | "month" | "custom";
export type ForecastDuration = 7 | 14 | 30;
