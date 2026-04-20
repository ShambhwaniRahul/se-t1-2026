import type { Ingredient } from "../data/type";

export const getPerishableStatus = (item: Ingredient) => {
  if (!item.expiryDate) return "in_stock";

  const today = new Date();
  const expiry = new Date(item.expiryDate);

  // Normalize time (important)
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiring_soon";

  return "in_stock";
};

