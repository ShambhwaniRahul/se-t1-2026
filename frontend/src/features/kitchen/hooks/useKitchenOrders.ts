import { useCallback, useState } from "react";
import type { KitchenOrder, KitchenOrderStatus } from "../data/kitchenData";
import { generateMockOrders } from "../data/kitchenData";

export function useKitchenOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>(generateMockOrders);

  const moveOrder = useCallback((orderId: string, newStatus: KitchenOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }, []);

  const getOrdersByStatus = useCallback(
    (status: KitchenOrderStatus) =>
      orders
        .filter((o) => o.status === status)
        .sort((a, b) => a.createdAt - b.createdAt),
    [orders]
  );

  return { orders, moveOrder, getOrdersByStatus };
}
