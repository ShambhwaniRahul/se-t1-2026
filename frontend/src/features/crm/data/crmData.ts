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
  id: string;
  name: string;
  phone: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  joinedAt: string;
  tags: string[];
  notes: CustomerNote[];
  orders: CustomerOrder[];
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Maria Santos",
    phone: "+1 (555) 234-8901",
    email: "maria.santos@email.com",
    loyaltyPoints: 1240,
    totalSpent: 3847.5,
    visitCount: 62,
    lastVisit: "2026-03-19",
    joinedAt: "2024-11-03",
    tags: ["VIP", "Regular"],
    notes: [
      { id: "n1", text: "Prefers window seating. Allergic to shellfish.", createdAt: "2026-02-14" },
      { id: "n2", text: "Birthday on March 28 — prepare complimentary dessert.", createdAt: "2026-03-10" },
    ],
    orders: [
      { id: "ORD-1041", date: "2026-03-19", items: ["Grilled Salmon", "Caesar Salad", "Sparkling Water"], total: 67.5, status: "completed" },
      { id: "ORD-1028", date: "2026-03-15", items: ["Margherita Pizza", "Tiramisu"], total: 34.0, status: "completed" },
      { id: "ORD-0987", date: "2026-03-08", items: ["Pasta Carbonara", "House Wine"], total: 42.0, status: "completed" },
    ],
  },
  {
    id: "cust-2",
    name: "James Okonkwo",
    phone: "+1 (555) 876-4321",
    email: "j.okonkwo@mail.com",
    loyaltyPoints: 480,
    totalSpent: 1290.0,
    visitCount: 23,
    lastVisit: "2026-03-17",
    joinedAt: "2025-06-18",
    tags: ["Regular"],
    notes: [
      { id: "n3", text: "Always orders extra hot sauce on the side.", createdAt: "2025-12-01" },
    ],
    orders: [
      { id: "ORD-1035", date: "2026-03-17", items: ["BBQ Burger", "Fries", "Cola"], total: 28.5, status: "completed" },
      { id: "ORD-1010", date: "2026-03-10", items: ["Chicken Wings x2", "Beer"], total: 38.0, status: "completed" },
    ],
  },
  {
    id: "cust-3",
    name: "Sophie Laurent",
    phone: "+1 (555) 112-9988",
    email: "sophie.l@inbox.com",
    loyaltyPoints: 85,
    totalSpent: 412.0,
    visitCount: 7,
    lastVisit: "2026-03-02",
    joinedAt: "2026-01-20",
    tags: ["New"],
    notes: [],
    orders: [
      { id: "ORD-0965", date: "2026-03-02", items: ["Veggie Bowl", "Green Juice"], total: 24.0, status: "completed" },
      { id: "ORD-0940", date: "2026-02-18", items: ["Mushroom Risotto"], total: 22.0, status: "refunded" },
    ],
  },
  {
    id: "cust-4",
    name: "David Chen",
    phone: "+1 (555) 443-7766",
    email: "dchen@proton.me",
    loyaltyPoints: 2100,
    totalSpent: 6230.0,
    visitCount: 98,
    lastVisit: "2026-03-20",
    joinedAt: "2024-03-12",
    tags: ["VIP", "Regular", "Catering"],
    notes: [
      { id: "n4", text: "Corporate catering contact — orders for 20+ people monthly.", createdAt: "2025-08-15" },
      { id: "n5", text: "Prefers invoiced billing for large orders.", createdAt: "2025-11-22" },
    ],
    orders: [
      { id: "ORD-1044", date: "2026-03-20", items: ["Catering Platter A x3", "Beverage Pack x2"], total: 485.0, status: "completed" },
      { id: "ORD-1020", date: "2026-03-12", items: ["Steak Dinner", "Red Wine"], total: 78.0, status: "completed" },
    ],
  },
  {
    id: "cust-5",
    name: "Aisha Patel",
    phone: "+1 (555) 667-2233",
    email: "aisha.p@gmail.com",
    loyaltyPoints: 310,
    totalSpent: 890.0,
    visitCount: 15,
    lastVisit: "2026-02-28",
    joinedAt: "2025-09-05",
    tags: ["Vegetarian"],
    notes: [
      { id: "n6", text: "Strict vegetarian — double-check all sauces.", createdAt: "2025-09-10" },
    ],
    orders: [
      { id: "ORD-0950", date: "2026-02-28", items: ["Paneer Tikka", "Naan", "Mango Lassi"], total: 32.0, status: "completed" },
      { id: "ORD-0912", date: "2026-02-14", items: ["Garden Salad", "Veggie Wrap"], total: 19.5, status: "cancelled" },
    ],
  },
  {
    id: "cust-6",
    name: "Marcus Rivera",
    phone: "+1 (555) 998-1122",
    email: "mrivera@outlook.com",
    loyaltyPoints: 0,
    totalSpent: 54.0,
    visitCount: 2,
    lastVisit: "2026-01-15",
    joinedAt: "2026-01-10",
    tags: ["New"],
    notes: [],
    orders: [
      { id: "ORD-0880", date: "2026-01-15", items: ["Fish & Chips", "Lemonade"], total: 26.0, status: "completed" },
      { id: "ORD-0875", date: "2026-01-10", items: ["Soup of the Day", "Bread Basket"], total: 28.0, status: "completed" },
    ],
  },
];
