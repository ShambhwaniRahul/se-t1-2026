import type { MenuItem } from "../data/types";

// backend → frontend map
export const mapToMenuItem = (item: any): MenuItem => ({
  id: String(item.id),
  name: item.name,
  categoryId: String(item.category),
  price: item.price,
  estimatedPrepTime: item.estimated_prep_time,
  isVeg: item.is_veg,
});

// frontend → backend map
export const mapToApiPayload = (item: Omit<MenuItem, "id">) => ({
  name: item.name,
  category: Number(item.categoryId),
  price: item.price,
  estimated_prep_time: item.estimatedPrepTime,
  is_veg: item.isVeg,
});