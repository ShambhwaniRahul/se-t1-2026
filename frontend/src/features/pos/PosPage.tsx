import { useCallback, useEffect, useMemo, useState } from "react";
import { POS_CATEGORIES, POS_PRODUCTS } from "./data";
import { useCart } from "./useCart";
import { CategoryBar } from "./CategoryBar";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { CheckoutBar } from "./CheckoutBar";
import { PaymentModal } from "./PaymentModal";
import { toast } from "sonner";

export default function PosPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [paymentOpen, setPaymentOpen] = useState(false);

  const cart = useCart();

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? POS_PRODUCTS
        : POS_PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const handlePay = useCallback(() => {
    if (cart.itemCount === 0) return;
    setPaymentOpen(true);
  }, [cart.itemCount]);

  const handleComplete = useCallback(() => {
    setPaymentOpen(false);
    cart.clearCart();
    toast.success("Order completed!");
  }, [cart]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Enter = pay
      if (e.key === "Enter" && !paymentOpen) {
        e.preventDefault();
        handlePay();
        return;
      }

      // Escape = clear cart or close modal
      if (e.key === "Escape") {
        if (paymentOpen) {
          setPaymentOpen(false);
        } else {
          cart.clearCart();
          toast("Cart cleared");
        }
        return;
      }

      // Number keys = quick add products with shortcuts
      const product = POS_PRODUCTS.find((p) => p.shortcut === e.key);
      if (product) {
        cart.addItem(product);
        toast(`Added ${product.name}`);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePay, paymentOpen, cart]);

  return (
    <div className="-m-4 md:-m-6 flex h-[calc(100svh-3.5rem)] flex-col">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left + Center: Categories + Products */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Category bar */}
          <div className="border-b bg-card px-4 py-3">
            <CategoryBar
              categories={POS_CATEGORIES}
              activeId={activeCategory}
              onSelect={setActiveCategory}
            />
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-auto p-4">
            <ProductGrid products={filteredProducts} onSelect={cart.addItem} />
          </div>
        </div>

        {/* Right: Cart panel */}
        <div className="hidden w-[340px] shrink-0 border-l bg-card md:flex md:flex-col lg:w-[380px]">
          <CartPanel
            items={cart.items}
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

      {/* Bottom: Checkout bar */}
      <CheckoutBar
        total={cart.total}
        itemCount={cart.itemCount}
        onPay={handlePay}
        onClear={cart.clearCart}
      />

      {/* Payment modal */}
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={cart.total}
        onComplete={handleComplete}
      />
    </div>
  );
}
