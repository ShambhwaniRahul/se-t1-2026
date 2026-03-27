// handles all the cart logic for the PoS page
import { useCallback, useState, useEffect, useMemo } from "react";
import { type DraftCartItem, type MenuItem, type OrderCartItem, ORDERED_ITEMS } from "../data/posData";
// import { clear } from "console";

export function useCart(tableId: string) {
  const [orderedItems, setOrderedItems] = useState<OrderCartItem[]>([]); // server state - ordered
  const [draftItems, setDraftItems] = useState<DraftCartItem[]>([]); // client state - draft
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // fetch current order
  useEffect(() => {
    if (!tableId) return;
    setLoading(true);
    const tableOrders: OrderCartItem[] = ORDERED_ITEMS.filter(
      (item) => item.table_id === tableId
    );

    setOrderedItems(tableOrders);
    setLoading(false);
  }, [tableId]);
      
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

  // add items to draft cart
  const addItem = useCallback((product: MenuItem) => {
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  // remove from draft cart
  const removeItem = useCallback((productId: string) => {
    setDraftItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  // update quantity in draft cart
  const updateQuantity = useCallback((productId: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  // send draft items to ordered items
  const submitDraft = useCallback(async () => {
    if (draftItems.length === 0) return;

    try {
      // await fetch(`/tables/${tableId}/order-items`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ items: draftItems })
      // });
      // setOrderedItems(prev => [...prev, ...draftItems]);
      setDraftItems([]);
    } catch (err) {
      console.error("Failed to submit order items", err);
    }
  }, [draftItems, tableId]);

  // clear draft cart
  const clearDraft = useCallback(() => {
    setDraftItems([]);
  }, []);

  // clears ordered cart when payment is complete
  const clearOrdered = useCallback(() => {
    setOrderedItems([]);
  }, []);

  // subtotal from ordered items
  const subtotal = useMemo(() => {
    return orderedItems.reduce(
      (sum, i) => sum + i.price,
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

  // only ordered items count towards item count, not draft items
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
