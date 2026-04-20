export interface Table {
  id: string;
  table_number: number;
  total_seats: number;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  estimatedPrepTime: number;
  isVeg: boolean;
  category: number;
}

export interface MenuCategory {
  id: number;
  label: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: -1, label: "All" },
  { id: 0, label: "Starter"},
  { id: 1, label: "Main Course"},
  { id: 2, label: "Dessert"},
  { id: 3, label: "Beverage"},
];

export const CATEGORY_EMOJI_MAP: Record<number, string> = {
  0: "🍔",
  1: "🍽️",
  2: "🍰",
  3: "🥤",
};

export interface CreateNewOrderRequest {
  id: number;
  table: number;
  dining_type: number;
  packaging_cost: number;
  items: {
    menu_item: number;
    special_instructions: string;
  }[];
}

export interface CreateNewOrderResponse {
  id: number;
  table: number;
  status: number;
  final_total: number;
  order_total: number;
  items: OrderMenuItem[];
}

export interface OrderMenuItem{
  id: number;
  order: number;
  menu_item: number;
  menu_item_name: string;
  chef: number | null;
  chef_name: string | null;
  menu_item_status: number;
  menu_item_status_display: string;
  price_at_time: number;
  special_instructions: string;
  created_at: string;
  updated_at: string;
}

export interface DraftCartItem {
  menu_item: MenuItem;
  quantity: number;
}


export interface GroupedItem {
  menu_item: number;
  name: string;
  price: number;
  items: OrderMenuItem[];
};

