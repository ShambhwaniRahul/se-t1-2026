import type { PerishableInventory, Ingredient, NonPerishableInventory } from "./type";
export const mapPerishableToIngredient = (item: PerishableInventory): Ingredient => ({
  id: item.id,
  name: item.sku_name,
  category: "perishable",

  quantity: item.quantity,
  unit: item.sku_unit,

  purchaseDate: item.purchase_date,
  expiryDate: item.expiry_date,
  isExpired: new Date(item.expiry_date) < new Date(),
});


export const mapNonPerishableToIngredient = (item: NonPerishableInventory): Ingredient => ({
  id: item.id,
  name: item.name,
  category: "non_perishable",

  quantity: item.quantity,
  unit: "units", // default (or decide)
});
