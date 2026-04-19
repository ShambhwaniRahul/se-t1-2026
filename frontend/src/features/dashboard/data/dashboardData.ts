export interface RevenueKPIs {
  total_revenue: number;
  total_orders: number;
  average_revenue_per_order: number;
}

export interface ActiveTables {
  total_tables: string;
  active_tables: number;
  inactive_tables: number;
}

export interface RevenueTrend {
  date: string;
  total_revenue: number;
  total_orders: number;
  average_revenue: number;
}

export interface SalesByCategory {
  category: string;
  total: number;
}

export interface TopSellingItems {
  name: string;
  sales_count: number;
  total_revenue: number;
}

export interface RecentOrders {
  order_id: number;
  table_number: number;
  status: string;
  dining_type: string;
  total_items: number;
  total_amount: number;
  created_at: string;
  timedelta_since_order: number;
}

export const REVENUE_TREND: DailyRevenue[] = [
  { date: "Mar 1", revenue: 2840, orders: 67 },
  { date: "Mar 2", revenue: 3120, orders: 74 },
  { date: "Mar 3", revenue: 2680, orders: 61 },
  { date: "Mar 4", revenue: 3450, orders: 82 },
  { date: "Mar 5", revenue: 3890, orders: 91 },
  { date: "Mar 6", revenue: 4210, orders: 98 },
  { date: "Mar 7", revenue: 4680, orders: 112 },
  { date: "Mar 8", revenue: 3970, orders: 94 },
  { date: "Mar 9", revenue: 3560, orders: 85 },
  { date: "Mar 10", revenue: 4120, orders: 96 },
  { date: "Mar 11", revenue: 3840, orders: 89 },
  { date: "Mar 12", revenue: 4350, orders: 103 },
  { date: "Mar 13", revenue: 4890, orders: 116 },
  { date: "Mar 14", revenue: 5230, orders: 124 },
];

export const TOP_ITEMS: TopItem[] = [
  { name: "Margherita Pizza", quantity: 187, revenue: 2431 },
  { name: "Grilled Salmon", quantity: 134, revenue: 3216 },
  { name: "Caesar Salad", quantity: 156, revenue: 1716 },
  { name: "Truffle Pasta", quantity: 98, revenue: 2254 },
  { name: "Wagyu Burger", quantity: 112, revenue: 2688 },
];

export const CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
  { category: "Mains", value: 42, fill: "hsl(var(--primary))" },
  { category: "Appetizers", value: 23, fill: "hsl(var(--info))" },
  { category: "Drinks", value: 19, fill: "hsl(var(--success))" },
  { category: "Desserts", value: 16, fill: "hsl(var(--warning))" },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: "a1", type: "order", description: "Table 7 — 4 items", amount: 87.40, time: "2 min ago" },
  { id: "a2", type: "order", description: "Takeout — Online #1042", amount: 34.90, time: "8 min ago" },
  { id: "a3", type: "refund", description: "Refund — Order #1038", amount: -12.00, time: "14 min ago" },
  { id: "a4", type: "order", description: "Table 3 — 6 items", amount: 142.60, time: "21 min ago" },
  { id: "a5", type: "reservation", description: "Reservation — 6 guests 7:30 PM", amount: 0, time: "25 min ago" },
  { id: "a6", type: "order", description: "Bar — 3 cocktails", amount: 39.00, time: "32 min ago" },
  { id: "a7", type: "order", description: "Table 12 — 2 items", amount: 56.80, time: "38 min ago" },
  { id: "a8", type: "refund", description: "Refund — Order #1031", amount: -8.50, time: "45 min ago" },
];

export const DASHBOARD_STATS = {
  todayRevenue: 5230,
  revenueTrend: 12.4,
  ordersToday: 124,
  ordersTrend: 8.2,
  avgTicket: 42.18,
  avgTicketTrend: 3.7,
  activeTables: 18,
  totalTables: 24,
};
