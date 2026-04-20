export interface PerishableSKU {
  id: number;
  name: string;
  unit: "KG" | "L" | "Pc";
  typical_shelf_life: number;
}

export interface PerishableInventory {
  id: number;
  sku: number;           // write (ID)
  sku_name: string;      // read
  sku_unit: string;

  purchase_date: string; // ISO date
  expiry_date: string;

  quantity: number;

  created_at: string;
  updated_at: string;
}

export interface NonPerishableInventory {
  id: number;
  name: string;
  quantity: number;

  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: number;

  name: string;
  category: "perishable" | "non_perishable";

  quantity: number;
  unit: string;

  // only for perishable
  purchaseDate?: string;
  expiryDate?: string;
  isExpired?: boolean;

  // future-ready
  minStock?: number;
}