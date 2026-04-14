import type { DailyRevenue, CategoryRevenue, PeakHourData, PerformingItem, StaffEfficiency } from "./types";

// 60 days of historical revenue data
export const HISTORICAL_REVENUE: DailyRevenue[] = Array.from({ length: 60 }, (_, i) => {
  const date = new Date(2026, 1, 1 + i); // Feb 1 - Apr 1
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const base = isWeekend ? 14000 : 10000;
  const growth = i * 45; // slight upward trend
  const noise = Math.sin(i * 0.7) * 1500 + Math.cos(i * 1.3) * 800;
  const revenue = Math.round(base + growth + noise);
  const orders = Math.round(revenue / 85 + (Math.random() - 0.5) * 20);
  return {
    date: date.toISOString().split("T")[0],
    revenue: Math.max(revenue, 5000),
    orders: Math.max(orders, 60),
  };
});

export const CATEGORY_REVENUE: CategoryRevenue[] = [
  { category: "Mains", revenue: 48200, fill: "hsl(var(--primary))" },
  { category: "Appetizers", revenue: 22100, fill: "hsl(var(--info))" },
  { category: "Beverages", revenue: 18900, fill: "hsl(var(--success))" },
  { category: "Desserts", revenue: 12400, fill: "hsl(var(--warning))" },
  { category: "Sides", revenue: 8600, fill: "hsl(var(--destructive))" },
];

export const PEAK_HOURS: PeakHourData[] = [
  { hour: "11am", monday: 3, tuesday: 2, wednesday: 4, thursday: 3, friday: 5, saturday: 7, sunday: 6 },
  { hour: "12pm", monday: 7, tuesday: 8, wednesday: 7, thursday: 8, friday: 9, saturday: 10, sunday: 9 },
  { hour: "1pm",  monday: 9, tuesday: 9, wednesday: 8, thursday: 9, friday: 10, saturday: 10, sunday: 10 },
  { hour: "2pm",  monday: 5, tuesday: 6, wednesday: 5, thursday: 5, friday: 7, saturday: 8, sunday: 7 },
  { hour: "3pm",  monday: 2, tuesday: 2, wednesday: 3, thursday: 2, friday: 3, saturday: 5, sunday: 4 },
  { hour: "5pm",  monday: 4, tuesday: 5, wednesday: 4, thursday: 5, friday: 6, saturday: 7, sunday: 5 },
  { hour: "6pm",  monday: 7, tuesday: 7, wednesday: 8, thursday: 8, friday: 9, saturday: 10, sunday: 8 },
  { hour: "7pm",  monday: 9, tuesday: 10, wednesday: 9, thursday: 10, friday: 10, saturday: 10, sunday: 9 },
  { hour: "8pm",  monday: 8, tuesday: 8, wednesday: 9, thursday: 9, friday: 10, saturday: 10, sunday: 8 },
  { hour: "9pm",  monday: 5, tuesday: 5, wednesday: 6, thursday: 6, friday: 8, saturday: 9, sunday: 6 },
];

export const TOP_ITEMS: PerformingItem[] = [
  { name: "Truffle Risotto", orders: 342, revenue: 8550, trend: 14.2 },
  { name: "Wagyu Burger", orders: 298, revenue: 7450, trend: 8.7 },
  { name: "Grilled Salmon", orders: 276, revenue: 6900, trend: 5.3 },
  { name: "Lobster Pasta", orders: 245, revenue: 7350, trend: 12.1 },
  { name: "Caesar Salad", orders: 312, revenue: 4680, trend: -2.1 },
];

export const LOW_ITEMS: PerformingItem[] = [
  { name: "Vegetable Soup", orders: 34, revenue: 340, trend: -18.5 },
  { name: "House Salad", orders: 42, revenue: 378, trend: -12.3 },
  { name: "Bread Basket", orders: 56, revenue: 280, trend: -8.9 },
  { name: "Fruit Platter", orders: 28, revenue: 420, trend: -22.1 },
  { name: "Steamed Rice", orders: 67, revenue: 268, trend: -5.4 },
];

export const STAFF_EFFICIENCY: StaffEfficiency[] = [
  { name: "Maria Santos", ordersHandled: 187, avgTime: 12, rating: 4.8 },
  { name: "James Chen", ordersHandled: 164, avgTime: 14, rating: 4.6 },
  { name: "Tomas Rivera", ordersHandled: 152, avgTime: 11, rating: 4.9 },
  { name: "Aisha Khan", ordersHandled: 143, avgTime: 15, rating: 4.5 },
  { name: "Lucas Müller", ordersHandled: 138, avgTime: 13, rating: 4.7 },
];

export const KPI_DATA = {
  today: { revenue: 14280, orders: 168, aov: 85.0, retention: 72.4, tableTurnover: 4.2, inventoryRate: 87.3 },
  week:  { revenue: 89400, orders: 1052, aov: 84.98, retention: 74.1, tableTurnover: 3.9, inventoryRate: 85.6 },
  month: { revenue: 348700, orders: 4104, aov: 84.97, retention: 76.8, tableTurnover: 4.0, inventoryRate: 86.1 },
  trends: { revenue: 12.4, orders: 8.2, aov: 3.7, retention: 2.1, tableTurnover: -1.3, inventoryRate: 1.8 },
};
