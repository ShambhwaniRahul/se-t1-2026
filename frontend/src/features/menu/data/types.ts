export interface MenuItem {
  id: string;
  name: string;
  price: number;
  estimatedPrepTime: number;
  isVeg: boolean;
  categoryId: string;
}

export interface MenuCategory {
  id: string;
  label: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "0", label: "Starter" },
  { id: "1", label: "Main Course" },
  { id: "2", label: "Dessert" },
  { id: "3", label: "Beverage" },
];
