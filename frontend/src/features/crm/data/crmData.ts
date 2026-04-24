export interface CustomerNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: "completed" | "refunded" | "cancelled";
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone_no: string;
  total_points: number;
  total_spent: number;
  total_visits: number;
  last_visit: string | null;
  created_at: string;
}


export interface CustomerOrderResponse {
  order_id: number;
  total_amount: number;
  created_at: string;
  order_items: string[];
}
