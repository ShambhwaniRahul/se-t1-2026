// each product has a category, name, price, and optional keyboard shortcut for quick selection
export interface Table {
  id: string;
  status: boolean;
}

// each product has a category, name, price, and optional keyboard shortcut for quick selection
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  shortcut?: string; // keyboard shortcut key for quick addition
}

// each order item is a menu item that has been sent to the backend
export interface OrderCartItem {
  order_id: string;
  table_id: string;
  menu_item_id: string;
  item_id: string;
  name: string;
  price: number;
  status: string;
}

export interface GroupedOrderItem {
  item_id: string
  name: string
  price: number
  items: OrderCartItem[]
}

// cart-item type
export interface DraftCartItem {
  product: MenuItem;
  quantity: number;
}

// menu-item categories 
export interface MenuItemCategory {
  id: string;
  name: string;
  emoji: string;
}

// a sample list of tables
export const TABLES: Table[] = [
  { id: "1", status: true },
  { id: "2", status: false },
  { id: "3", status: false },
  { id: "4", status: false },
  { id: "5", status: false },
  { id: "6", status: false },
];

// a sample list of predefined product categories
export const POS_CATEGORIES: MenuItemCategory[] = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "sides", name: "Sides", emoji: "🍟" },
  { id: "drinks", name: "Drinks", emoji: "🥤" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
];

// a sample list of products available in the POS system, categorized and priced accordingly
export const POS_PRODUCTS: MenuItem[] = [
  { id: "b1", name: "Classic Burger", price: 9.99, category: "burgers", shortcut: "1" },
  { id: "b2", name: "Cheese Burger", price: 11.49, category: "burgers", shortcut: "2" },
  { id: "b3", name: "Double Smash", price: 14.99, category: "burgers" },
  { id: "b4", name: "Chicken Burger", price: 12.49, category: "burgers" },
  { id: "b5", name: "Veggie Burger", price: 10.99, category: "burgers" },
  { id: "b6", name: "BBQ Bacon", price: 13.99, category: "burgers" },

  { id: "p1", name: "Margherita", price: 12.99, category: "pizza", shortcut: "3" },
  { id: "p2", name: "Pepperoni", price: 14.99, category: "pizza", shortcut: "4" },
  { id: "p3", name: "Hawaiian", price: 13.99, category: "pizza" },
  { id: "p4", name: "Veggie Supreme", price: 14.49, category: "pizza" },
  { id: "p5", name: "Meat Lovers", price: 16.99, category: "pizza" },

  { id: "s1", name: "French Fries", price: 4.49, category: "sides", shortcut: "5" },
  { id: "s2", name: "Onion Rings", price: 5.49, category: "sides" },
  { id: "s3", name: "Caesar Salad", price: 7.99, category: "sides" },
  { id: "s4", name: "Garlic Bread", price: 4.99, category: "sides" },
  { id: "s5", name: "Mozzarella Sticks", price: 6.49, category: "sides" },
  { id: "s6", name: "Coleslaw", price: 3.49, category: "sides" },

  { id: "d1", name: "Cola", price: 2.49, category: "drinks", shortcut: "6" },
  { id: "d2", name: "Lemonade", price: 3.49, category: "drinks", shortcut: "7" },
  { id: "d3", name: "Iced Tea", price: 2.99, category: "drinks" },
  { id: "d4", name: "Water", price: 1.49, category: "drinks" },
  { id: "d5", name: "Orange Juice", price: 3.99, category: "drinks" },
  { id: "d6", name: "Milkshake", price: 5.99, category: "drinks" },

  { id: "x1", name: "Brownie", price: 4.99, category: "desserts", shortcut: "8" },
  { id: "x2", name: "Cheesecake", price: 6.99, category: "desserts" },
  { id: "x3", name: "Ice Cream", price: 3.99, category: "desserts" },
  { id: "x4", name: "Apple Pie", price: 5.49, category: "desserts" },
];

// a sample list of ordered items for testing the cart and order summary
export const ORDERED_ITEMS: OrderCartItem[] = [
  { order_id: "#1245", table_id: "1", menu_item_id: "0", item_id: "b1", name: "Classic Burger", price: 9.99, status: "pending"},
  { order_id: "#1245", table_id: "1", menu_item_id: "1", item_id: "b1", name: "Classic Burger", price: 9.99, status: "ready"},
  { order_id: "#1245", table_id: "1", menu_item_id: "2", item_id: "p2", name: "Pepperoni Pizza", price: 14.99, status: "in-progress"},
  { order_id: "#1245", table_id: "1", menu_item_id: "3", item_id: "s1", name: "French Fries", price: 4.49, status: "ready"},
  { order_id: "#1245", table_id: "1", menu_item_id: "4", item_id: "d3", name: "Iced Tea", price: 2.99, status: "pending"},
];
