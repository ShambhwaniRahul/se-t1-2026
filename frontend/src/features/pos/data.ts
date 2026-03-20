// each product has a category, name, price, and optional keyboard shortcut for quick selection
export interface PosProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  shortcut?: string; // keyboard shortcut key
}

// cart item includes the product and the quantity ordered
export interface CartItem {
  product: PosProduct;
  quantity: number;
}

// categories for filtering products in the POS interface, each with a name and an emoji for visual identification
export interface PosCategory {
  id: string;
  name: string;
  emoji: string;
}

// a sample list of predefined product categories for the POS system
export const POS_CATEGORIES: PosCategory[] = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "sides", name: "Sides", emoji: "🍟" },
  { id: "drinks", name: "Drinks", emoji: "🥤" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
];

// a sample list of products available in the POS system, categorized and priced accordingly
export const POS_PRODUCTS: PosProduct[] = [
  // Burgers
  { id: "b1", name: "Classic Burger", price: 9.99, category: "burgers", shortcut: "1" },
  { id: "b2", name: "Cheese Burger", price: 11.49, category: "burgers", shortcut: "2" },
  { id: "b3", name: "Double Smash", price: 14.99, category: "burgers" },
  { id: "b4", name: "Chicken Burger", price: 12.49, category: "burgers" },
  { id: "b5", name: "Veggie Burger", price: 10.99, category: "burgers" },
  { id: "b6", name: "BBQ Bacon", price: 13.99, category: "burgers" },
  // Pizza
  { id: "p1", name: "Margherita", price: 12.99, category: "pizza", shortcut: "3" },
  { id: "p2", name: "Pepperoni", price: 14.99, category: "pizza", shortcut: "4" },
  { id: "p3", name: "Hawaiian", price: 13.99, category: "pizza" },
  { id: "p4", name: "Veggie Supreme", price: 14.49, category: "pizza" },
  { id: "p5", name: "Meat Lovers", price: 16.99, category: "pizza" },
  // Sides
  { id: "s1", name: "French Fries", price: 4.49, category: "sides", shortcut: "5" },
  { id: "s2", name: "Onion Rings", price: 5.49, category: "sides" },
  { id: "s3", name: "Caesar Salad", price: 7.99, category: "sides" },
  { id: "s4", name: "Garlic Bread", price: 4.99, category: "sides" },
  { id: "s5", name: "Mozzarella Sticks", price: 6.49, category: "sides" },
  { id: "s6", name: "Coleslaw", price: 3.49, category: "sides" },
  // Drinks
  { id: "d1", name: "Cola", price: 2.49, category: "drinks", shortcut: "6" },
  { id: "d2", name: "Lemonade", price: 3.49, category: "drinks", shortcut: "7" },
  { id: "d3", name: "Iced Tea", price: 2.99, category: "drinks" },
  { id: "d4", name: "Water", price: 1.49, category: "drinks" },
  { id: "d5", name: "Orange Juice", price: 3.99, category: "drinks" },
  { id: "d6", name: "Milkshake", price: 5.99, category: "drinks" },
  // Desserts
  { id: "x1", name: "Brownie", price: 4.99, category: "desserts", shortcut: "8" },
  { id: "x2", name: "Cheesecake", price: 6.99, category: "desserts" },
  { id: "x3", name: "Ice Cream", price: 3.99, category: "desserts" },
  { id: "x4", name: "Apple Pie", price: 5.49, category: "desserts" },
];
