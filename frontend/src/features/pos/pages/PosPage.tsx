import { useCallback, useEffect, useMemo, useState } from "react";
import { MENU_CATEGORIES, type MenuCategory, type MenuItem } from "@/config/types/order";
import { useCart } from "../hooks/useCart";
import { ItemCategoryBar } from "../components/items/ItemCategoryBar";
import { ItemGrid } from "../components/items/ItemGrid";
import { CartPanel } from "../components/cart/CartPanel";
import { CheckoutBar } from "../components/CheckoutBar";
import { PaymentModal } from "../components/PaymentModal";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import api from "@/lib/api";

export default function PosPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<MenuCategory["id"]>(-1);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { tableId } = useParams();
  
  if (!tableId) {
    return <div> Invalid table </div>;
  }

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
        const result = await api.get("/pos/menuitems/");
        if (result.data.success) {
            setMenuItems(result.data.data ?? []);
            toast.success(result.data.message || "Menu items loaded successfully!");
        } else {
            toast.error(result.data.message || "Failed to load menu items!");
        }
    } catch (err) {
        console.error("Failed to load menu items", err);
        toast.error("Failed to load menu items!");
    } finally {
        setLoading(false);
    }
  }

  const cart = useCart(tableId!);
  const filteredProducts = useMemo(
    () =>
      activeCategory === -1
        ? menuItems
        : menuItems.filter((p) => p.category === activeCategory),
    [activeCategory, menuItems]
  );

  const handlePay = useCallback(() => {
    if (!(cart.draftItemCount === 0 && cart.orderedItemCount !== 0)) return;
    setPaymentOpen(true);
  }, [cart.draftItemCount, cart.orderedItemCount]);

  const handleComplete = useCallback(() => {
    setPaymentOpen(false);
    cart.clearOrdered();
    toast.success("Order completed!");
  }, [cart]);

  return (
    <div className="-m-4 md:-m-6 flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b bg-card px-4 py-3">
            <ItemCategoryBar
              categories={MENU_CATEGORIES}
              activeId={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          <div className="flex-1 overflow-auto p-4">
            <ItemGrid products={filteredProducts} onSelect={cart.addItem} />
          </div>
        </div>

        <div className="hidden w-[340px] shrink-0 border-l bg-card md:flex md:flex-col lg:w-[380px]">
          <CartPanel
            orderedItems={cart.orderedItems}
            draftItems={cart.draftItems}
            subtotal={cart.subtotal}
            discountPercent={cart.discountPercent}
            discountAmount={cart.discountAmount}
            total={cart.total}
            onUpdateQuantity={cart.updateQuantity}
            onRemove={cart.removeItem}
            onApplyDiscount={cart.setDiscountPercent}
          />
        </div>
      </div>

      <CheckoutBar
        total={cart.total}
        orderedItemCount={cart.orderedItemCount}
        draftItemCount={cart.draftItemCount}
        onPay={handlePay}
        onClear={cart.clearDraft}
        submitDraft={cart.submitDraft}
      />

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={cart.total}
        onComplete={handleComplete}
      />
    </div>
  );
}
