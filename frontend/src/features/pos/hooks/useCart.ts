import { useCallback, useState, useEffect, useMemo } from "react";
import { type DraftCartItem, type MenuItem, type OrderMenuItem} from "@/config/types/order";
import api from "@/lib/api";
import { toast } from "sonner";


export function useCart(tableId: string) {
  const [orderedItems, setOrderedItems] = useState<OrderMenuItem[]>([]);
  const [draftItems, setDraftItems] = useState<DraftCartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch current order by table numner
  // useEffect(() => {
  //   if (!tableId) return;
  //   setLoading(true);
  //   const tableOrders: OrderCartItem[] = ORDERED_ITEMS.filter(
  //     (item) => item.table_id === tableId
  //   );

  //   setOrderedItems(tableOrders);
  //   setLoading(false);
  // }, [tableId]);
      
  // useEffect(() => {
  //   async function fetchOrder() {
  //     setLoading(true);
  //     try {
  //       const res = await fetch(`/tables/${tableId}/current-order`);
  //       const data = await res.json();
  //       setOrderedItems(data.items ?? []);
  //     } catch (err) {
  //       console.error("Failed to load order", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  
  //   fetchOrder();
  // }, [tableId]);

  useEffect(() => {
    fetchOrder();
  }, [tableId]);

  async function fetchOrder() {
    setLoading(true);
    try {
      // const res = await api.get(`/pos/tables/${tableId}/current-order/`);
      const data = res.data;
      if (data.success) {
        setOrderedItems(data.data.items ?? []);
      } else {
        toast.error(data.message || "Failed to load current order!");
        console.log("Failed to load current order", data.message);
      }
    } catch (err) {
      toast.error("Failed to load current order!");
      console.error("Failed to load current order", err);
    } finally {
      setLoading(false);
    }
  }

  const addItem = useCallback((product: MenuItem) => {
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.menu_item.id == product.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item: product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setDraftItems((prev) => prev.filter((i) => i.menu_item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((i) =>
          i.menu_item.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const submitDraft = useCallback(async () => {
    if (draftItems.length === 0) return;

    try {
      const items = draftItems.flatMap(item =>
        Array.from({ length: item.quantity }, 
          () => ({ 
            menu_item: item.menu_item.id, 
            special_instructions: "" 
          }))
      );
      
      const payload = {
        table: parseInt(tableId),
        dining_type: 0,
        packaging_cost: 0,
        items: items
      }
      
      console.log("Submitting draft items:", payload);

      let result = null
      if (orderedItems.length == 0) {
        result = await api.post("/pos/orders/", payload)
      }

      else {
        const active_order_id = orderedItems[0].order;
        result = await api.post(`/pos/orders/${active_order_id}/add-items/`, {items: payload.items});
      }

      if(result.data.success) {
        toast.success(result.data.message || "Order submitted successfully!");
        const order_id = result.data.data.id;
        const ordered_items = await api.get(`/pos/orders/${order_id}/menuitems/`);
        setOrderedItems(prev => [...prev, ...ordered_items.data.data]);
      } else {
        toast.error(result.data.message || "Failed to submit order items!");
        console.log("Failed to submit order items", result.data.message);
      }
      
    } catch (err) {
      toast.error("Failed to submit order items!");
      console.log("Failed to submit order items", err);
      console.log(">>> Errors", draftItems);

    } finally{
      setDraftItems([]);
    }
  }, [draftItems, tableId]);

  const clearDraft = useCallback(() => {
    setDraftItems([]);
  }, []);

  const clearOrdered = useCallback(() => {
    setOrderedItems([]);
  }, []);

  const subtotal = useMemo(() => {
    return orderedItems.reduce(
      (sum, i) => sum + i.price_at_time,
      0
    );
  }, [orderedItems]);

  const discountAmount = useMemo(
    () => subtotal * (discountPercent / 100),
    [subtotal, discountPercent]
  );

  const total = useMemo(
    () => subtotal - discountAmount,
    [subtotal, discountAmount]
  );

  const draftItemCount = useMemo(
    () => draftItems.reduce((sum, i) => sum + i.quantity, 0),
    [draftItems]
  );

  const orderedItemCount = useMemo(
    () => orderedItems.length,
    [orderedItems]
  );

  return {
    loading, 

    orderedItems,
    clearOrdered,

    draftItems,
    addItem,
    removeItem,
    updateQuantity,
    submitDraft,
    clearDraft,

    discountPercent,
    setDiscountPercent,

    subtotal,
    discountAmount,
    total,

    draftItemCount,
    orderedItemCount
  };
}
