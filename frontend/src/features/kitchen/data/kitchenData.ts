export type KitchenOrderStatus = "new" | "preparing" | "ready";

export interface KitchenOrderItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  status: KitchenOrderStatus;
  createdAt: number; // timestamp ms
  items: KitchenOrderItem[];
  specialInstructions?: string;
}

export const KITCHEN_COLUMNS: { id: KitchenOrderStatus; label: string; accent: string }[] = [
  { id: "new", label: "🔴 New", accent: "destructive" },
  { id: "preparing", label: "🟡 Preparing", accent: "warning" },
  { id: "ready", label: "🟢 Ready", accent: "success" },
];

export function generateMockOrders(): KitchenOrder[] {
  const now = Date.now();
  return [
    {
      id: "k1",
      orderNumber: "#1042",
      status: "new",
      createdAt: now - 45_000,
      items: [
        { name: "Classic Burger", quantity: 2 },
        { name: "French Fries", quantity: 1 },
        { name: "Cola", quantity: 2 },
      ],
      specialInstructions: "No onions on burgers",
    },
    {
      id: "k2",
      orderNumber: "#1043",
      status: "new",
      createdAt: now - 120_000,
      items: [
        { name: "Pepperoni Pizza", quantity: 1 },
        { name: "Garlic Bread", quantity: 1 },
      ],
    },
    {
      id: "k3",
      orderNumber: "#1044",
      status: "new",
      createdAt: now - 200_000,
      items: [
        { name: "Veggie Burger", quantity: 1 },
        { name: "Caesar Salad", quantity: 1 },
        { name: "Lemonade", quantity: 1 },
      ],
      specialInstructions: "Gluten-free bun please",
    },
    {
      id: "k4",
      orderNumber: "#1039",
      status: "preparing",
      createdAt: now - 300_000,
      items: [
        { name: "Double Smash", quantity: 1 },
        { name: "Onion Rings", quantity: 1 },
        { name: "Milkshake", quantity: 1 },
      ],
    },
    {
      id: "k5",
      orderNumber: "#1040",
      status: "preparing",
      createdAt: now - 480_000,
      items: [
        { name: "Meat Lovers Pizza", quantity: 2 },
        { name: "Mozzarella Sticks", quantity: 1 },
      ],
      specialInstructions: "Extra cheese",
    },
    {
      id: "k6",
      orderNumber: "#1037",
      status: "ready",
      createdAt: now - 600_000,
      items: [
        { name: "Margherita Pizza", quantity: 1 },
        { name: "Iced Tea", quantity: 2 },
      ],
    },
  ];
}
