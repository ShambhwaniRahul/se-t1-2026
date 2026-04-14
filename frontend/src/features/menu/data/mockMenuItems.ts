import type { MenuItem } from "./types";

export const initialMenuItems: MenuItem[] = [
  { id: "mi-001", name: "Spring Rolls", categoryId: "appetizers", price: 180, estimatedPrepTime: 12, isVeg: true },
  { id: "mi-002", name: "Chicken Wings", categoryId: "appetizers", price: 280, estimatedPrepTime: 18, isVeg: false },
  { id: "mi-003", name: "Paneer Tikka", categoryId: "appetizers", price: 250, estimatedPrepTime: 15, isVeg: true },
  { id: "mi-004", name: "Butter Chicken", categoryId: "main-course", price: 380, estimatedPrepTime: 25, isVeg: false },
  { id: "mi-005", name: "Dal Makhani", categoryId: "main-course", price: 280, estimatedPrepTime: 20, isVeg: true },
  { id: "mi-006", name: "Grilled Salmon", categoryId: "main-course", price: 520, estimatedPrepTime: 22, isVeg: false },
  { id: "mi-007", name: "Palak Paneer", categoryId: "main-course", price: 300, estimatedPrepTime: 18, isVeg: true },
  { id: "mi-008", name: "Lamb Biryani", categoryId: "main-course", price: 420, estimatedPrepTime: 30, isVeg: false },
  { id: "mi-009", name: "Mango Lassi", categoryId: "beverages", price: 120, estimatedPrepTime: 5, isVeg: true },
  { id: "mi-010", name: "Masala Chai", categoryId: "beverages", price: 80, estimatedPrepTime: 4, isVeg: true },
  { id: "mi-011", name: "Cold Coffee", categoryId: "beverages", price: 150, estimatedPrepTime: 5, isVeg: true },
  { id: "mi-012", name: "Gulab Jamun", categoryId: "desserts", price: 160, estimatedPrepTime: 8, isVeg: true },
  { id: "mi-013", name: "Chocolate Lava Cake", categoryId: "desserts", price: 280, estimatedPrepTime: 15, isVeg: true },
  { id: "mi-014", name: "Chicken Tikka Masala", categoryId: "main-course", price: 360, estimatedPrepTime: 22, isVeg: false },
  { id: "mi-015", name: "Veggie Burger", categoryId: "main-course", price: 220, estimatedPrepTime: 14, isVeg: true },
];
