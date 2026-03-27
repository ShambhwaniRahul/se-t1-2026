import { useCallback, useState } from "react";
import type { Ingredient, StockMovement } from "../data/inventoryData";
import { MOCK_INGREDIENTS, MOCK_MOVEMENTS } from "../data/inventoryData";

export function useInventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS);
  const [movements] = useState<StockMovement[]>(MOCK_MOVEMENTS);

  const addIngredient = useCallback((ingredient: Omit<Ingredient, "id">) => {
    const id = `i${Date.now()}`;
    setIngredients((prev) => [...prev, { ...ingredient, id }]);
  }, []);

  const updateIngredient = useCallback((id: string, updates: Partial<Omit<Ingredient, "id">>) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing))
    );
  }, []);

  const deleteIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }, []);

  const getMovements = useCallback(
    (ingredientId?: string) =>
      ingredientId
        ? movements.filter((m) => m.ingredientId === ingredientId)
        : movements,
    [movements]
  );

  return { ingredients, addIngredient, updateIngredient, deleteIngredient, getMovements };
}
