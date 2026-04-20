export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface PerishableInventory {
  id: number;
  sku: number;
  sku_name: string;
  sku_unit: string;
  purchase_date: string;
  expiry_date: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface PerishableSKU {
  id: number;
  name: string;
  unit: string;
  typical_shelf_life: number;
}

export interface NonPerishableInventory {
  id: number;
  name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}
export interface StockMovement {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  date: string; // ISO date
  note: string;
}

export type IngredientCategory =
  | "proteins"
  | "dairy"
  | "produce"
  | "dry_goods"
  | "beverages"
  | "condiments";

export const INGREDIENT_CATEGORIES: { id: IngredientCategory; label: string }[] = [
  { id: "proteins", label: "Proteins" },
  { id: "dairy", label: "Dairy" },
  { id: "produce", label: "Produce" },
  { id: "dry_goods", label: "Dry Goods" },
  { id: "beverages", label: "Beverages" },
  { id: "condiments", label: "Condiments" },
];

export const SUPPLIERS = [
  "FreshFarms Co.",
  "Metro Wholesale",
  "Daily Dairy Ltd.",
  "BevCo Distributors",
  "GreenLeaf Produce",
];

export function getStockStatus(ingredient: Ingredient): StockStatus {
  if (ingredient.currentStock <= 0) return "out_of_stock";
  if (ingredient.currentStock <= ingredient.minStock) return "low_stock";
  return "in_stock";
}

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Beef Patties", category: "proteins", unit: "pcs", currentStock: 120, minStock: 50, costPerUnit: 2.5, supplier: "FreshFarms Co.", lastRestocked: "2026-03-15" },
  { id: "i2", name: "Chicken Breast", category: "proteins", unit: "kg", currentStock: 18, minStock: 20, costPerUnit: 8.0, supplier: "FreshFarms Co.", lastRestocked: "2026-03-14" },
  { id: "i3", name: "Mozzarella Cheese", category: "dairy", unit: "kg", currentStock: 8, minStock: 10, costPerUnit: 12.0, supplier: "Daily Dairy Ltd.", lastRestocked: "2026-03-13" },
  { id: "i4", name: "Cheddar Cheese", category: "dairy", unit: "kg", currentStock: 15, minStock: 10, costPerUnit: 10.0, supplier: "Daily Dairy Ltd.", lastRestocked: "2026-03-16" },
  { id: "i5", name: "Lettuce", category: "produce", unit: "heads", currentStock: 30, minStock: 15, costPerUnit: 1.5, supplier: "GreenLeaf Produce", lastRestocked: "2026-03-17" },
  { id: "i6", name: "Tomatoes", category: "produce", unit: "kg", currentStock: 5, minStock: 12, costPerUnit: 3.0, supplier: "GreenLeaf Produce", lastRestocked: "2026-03-15" },
  { id: "i7", name: "Burger Buns", category: "dry_goods", unit: "pcs", currentStock: 200, minStock: 80, costPerUnit: 0.5, supplier: "Metro Wholesale", lastRestocked: "2026-03-16" },
  { id: "i8", name: "Pizza Dough", category: "dry_goods", unit: "pcs", currentStock: 0, minStock: 30, costPerUnit: 1.2, supplier: "Metro Wholesale", lastRestocked: "2026-03-10" },
  { id: "i9", name: "Cola Syrup", category: "beverages", unit: "L", currentStock: 25, minStock: 10, costPerUnit: 15.0, supplier: "BevCo Distributors", lastRestocked: "2026-03-12" },
  { id: "i10", name: "Ketchup", category: "condiments", unit: "L", currentStock: 4, minStock: 5, costPerUnit: 6.0, supplier: "Metro Wholesale", lastRestocked: "2026-03-14" },
  { id: "i11", name: "Mayonnaise", category: "condiments", unit: "L", currentStock: 12, minStock: 5, costPerUnit: 5.5, supplier: "Metro Wholesale", lastRestocked: "2026-03-16" },
  { id: "i12", name: "Onions", category: "produce", unit: "kg", currentStock: 22, minStock: 10, costPerUnit: 2.0, supplier: "GreenLeaf Produce", lastRestocked: "2026-03-17" },
];

export const MOCK_MOVEMENTS: StockMovement[] = [
  { id: "m1", ingredientId: "i1", ingredientName: "Beef Patties", type: "in", quantity: 100, date: "2026-03-15", note: "Weekly delivery" },
  { id: "m2", ingredientId: "i1", ingredientName: "Beef Patties", type: "out", quantity: 45, date: "2026-03-16", note: "Daily usage" },
  { id: "m3", ingredientId: "i2", ingredientName: "Chicken Breast", type: "in", quantity: 25, date: "2026-03-14", note: "Restocked" },
  { id: "m4", ingredientId: "i2", ingredientName: "Chicken Breast", type: "out", quantity: 12, date: "2026-03-16", note: "Daily usage" },
  { id: "m5", ingredientId: "i8", ingredientName: "Pizza Dough", type: "out", quantity: 30, date: "2026-03-12", note: "Weekend rush" },
  { id: "m6", ingredientId: "i6", ingredientName: "Tomatoes", type: "adjustment", quantity: -3, date: "2026-03-16", note: "Spoilage write-off" },
  { id: "m7", ingredientId: "i3", ingredientName: "Mozzarella Cheese", type: "in", quantity: 10, date: "2026-03-13", note: "Delivery" },
  { id: "m8", ingredientId: "i10", ingredientName: "Ketchup", type: "out", quantity: 2, date: "2026-03-15", note: "Daily usage" },
  { id: "m9", ingredientId: "i5", ingredientName: "Lettuce", type: "in", quantity: 20, date: "2026-03-17", note: "Morning delivery" },
  { id: "m10", ingredientId: "i9", ingredientName: "Cola Syrup", type: "in", quantity: 15, date: "2026-03-12", note: "BevCo order" },
];
