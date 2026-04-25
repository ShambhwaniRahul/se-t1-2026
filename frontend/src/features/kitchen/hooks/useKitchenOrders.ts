import { useCallback, useEffect, useState } from "react";
import { STATUS_MAP, STATUS_TO_BACKEND, type KitchenItem, type KitchenStatus } from "../data/kitchenData";
import { toast } from "sonner";
import api from "@/lib/api";
import type { OrderMenuItem } from "@/config/types/order";
import { useAuth } from "@/features/auth/hooks/useAuth"; // adjust path if needed

export function useKitchenOrders() {
  const { user } = useAuth(); // or whatever your context hook is
  const [items, setItems] = useState<KitchenItem[]>([]);

  useEffect(() => {
    fetchOrderedMenuItems();

    const interval = setInterval(() => {
      fetchOrderedMenuItems();
    }, 10000); // every 10 sec

    return () => clearInterval(interval);
  }, []);

  const fetchOrderedMenuItems = async () => {
    try {
      const result = await api.get("/pos/orders/all-menuitems/");
      if (result.data.success) {
      const mapped: KitchenItem[] = (result.data.data ?? []).map(
        (item: OrderMenuItem) => ({
          ...item,
          status: STATUS_MAP[item.menu_item_status_display],
        })
      );

      // need merging instead of replacement to avoid UI flickering and preserve item status during updates
      setItems((prev) => {
        const map = new Map(prev.map((i) => [i.id, i]));

        for (const newItem of mapped) {
          const existing = map.get(newItem.id);

          map.set(newItem.id, {
            ...newItem,
            status: existing?.status ?? newItem.status,
          });
        }

        return Array.from(map.values());
      });
    } else {
      toast.error(result.data.message || "Failed to fetch ordered menu items!");
      setItems([]);
    }

    } catch (err) {
      toast.error("Failed to fetch ordered menu items!");
      console.log("Failed to fetch ordered menu items:", err)
      
    }
  }

  const moveItem = useCallback(
    async (id: number, newStatus: KitchenStatus) => {
      const prevItems = [...items];
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      try {
        const result = await api.patch(`/pos/orders/update-menu-items/${id}/status/`, { "menu_item_status": STATUS_TO_BACKEND[newStatus] });
        if (!result.data.success) {
          toast.error(result.data.message || "Failed to update item status");
          throw new Error();
        } else {
          toast.success("Item status updated successfully");
        }

      } catch (err) {
        toast.error("Failed to update item status");
        console.log("Failed to update item status:", err);
        setItems(prevItems);
      }
    },
    []
  );

    const getItemsByStatus = useCallback(
    (status: KitchenStatus) =>
      items
        .filter((item) => {
          const isPending = item.status === "pending";

          const isAssignedToChef =
            item.chef === user?.id;

          return isPending || isAssignedToChef;
        })
        .filter((item) => item.status === status)
        .sort((a, b) => {
          const timeA = Date.parse(a.created_at);
          const timeB = Date.parse(b.created_at);
          return timeA - timeB;
        }),
    [items, user]
  );

  // const getItemsByStatus = useCallback(
  //   (status: KitchenStatus) =>
  //     items
  //       .filter((item) => item.status === status)
  //       .sort((a, b) => {
  //         const timeA = Date.parse(a.created_at);
  //         const timeB = Date.parse(b.created_at);
  //         return timeA - timeB;
  //       }),
  //   [items]
  // );

  return {
    items,
    moveItem,
    getItemsByStatus,
    refetch: fetchOrderedMenuItems,
  };
}