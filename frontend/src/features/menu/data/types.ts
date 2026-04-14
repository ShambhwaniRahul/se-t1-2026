export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  estimatedPrepTime: number;
  isVeg: boolean;
}

export interface MenuCategory {
  id: string;
  label: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "appetizers", label: "Appetizers" },
  { id: "main-course", label: "Main Course" },
  { id: "beverages", label: "Beverages" },
  { id: "desserts", label: "Desserts" },
];
