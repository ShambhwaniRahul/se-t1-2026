import type { MenuItem } from "../../../config/types/order";

// backend → frontend map
export const mapToMenuItem = (item: any): MenuItem => ({
  id: Number(item.id),
  name: item.name,
  category: Number(item.category),
  category_name: item.category_name || "",
  price: Number(item.price),
  estimated_prep_time: Number(item.estimated_prep_time),
  discount: Number(item.discount || 0),
  is_veg: Boolean(item.is_veg),
  created_at: item.created_at || "",
  updated_at: item.updated_at || "",
});

// frontend → backend map
export const mapToApiPayload = (item: any) => ({
  name: item.name,
  category: Number(item.category),
  price: Number(item.price),
  estimated_prep_time: Number(item.estimated_prep_time),
  discount: Number(item.discount || 0),
  is_veg: Boolean(item.is_veg),
});