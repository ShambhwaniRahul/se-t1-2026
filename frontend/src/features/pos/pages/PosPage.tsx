import { useCallback, useEffect, useMemo, useState } from "react";
import { POS_CATEGORIES, POS_PRODUCTS } from "../data/posData";
import { useCart } from "../hooks/useCart";
import { ItemCategoryBar } from "../components/items/ItemCategoryBar";
import { ItemGrid } from "../components/items/ItemGrid";
import { CartPanel } from "../components/cart/CartPanel";
import { CheckoutBar } from "../components/CheckoutBar";
import { PaymentModal } from "../components/PaymentModal";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

export default function PosPage() {
  const [activeCategory, setActiveCategory] = useState("all"); // menuItem category filter
  const [paymentOpen, setPaymentOpen] = useState(false); // payment modal open state

  const { tableId } = useParams();
  
  if (!tableId) {
    return <div> Invalid table </div>;
  }

  const cart = useCart(tableId!);

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? POS_PRODUCTS
        : POS_PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory]
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

  // Keyboard shortcuts
  // useEffect(() => {
  //   const handler = (e: KeyboardEvent) => {
  //     // Ignore when typing in inputs
  //     if (
  //       e.target instanceof HTMLInputElement ||
  //       e.target instanceof HTMLTextAreaElement
  //     )
  //       return;

  //     // Enter = pay
  //     if (e.key === "Enter" && !paymentOpen) {
  //       e.preventDefault();
  //       handlePay();
  //       return;
  //     }

  //     // Escape = clear cart or close modal
  //     if (e.key === "Escape") {
  //       if (paymentOpen) {
  //         setPaymentOpen(false);
  //       } else {
  //         cart.clearDraft();
  //         toast("Cart cleared");
  //       }
  //       return;
  //     }

  //     // Number keys = quick add products with shortcuts
  //     const product = POS_PRODUCTS.find((p) => p.shortcut === e.key);
  //     if (product) {
  //       cart.addItem(product);
  //       toast(`Added ${product.name}`);
  //     }
  //   };

  //   window.addEventListener("keydown", handler);
  //   return () => window.removeEventListener("keydown", handler);
  // }, [handlePay, paymentOpen, cart]);

  return (
    <div className="-m-4 md:-m-6 flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b bg-card px-4 py-3">
            <ItemCategoryBar
              categories={POS_CATEGORIES}
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
