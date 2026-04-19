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