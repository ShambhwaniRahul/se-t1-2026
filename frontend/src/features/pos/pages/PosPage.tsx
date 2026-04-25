import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { MENU_CATEGORIES, type MenuItem } from "@/config/types/order";
import { useCart } from "../hooks/useCart";
import { ItemCategoryBar } from "../components/items/ItemCategoryBar";
import { ItemGrid } from "../components/items/ItemGrid";
import { CartPanel } from "../components/cart/CartPanel";
import { CheckoutBar } from "../components/CheckoutBar";
import { PaymentModal } from "../components/PaymentModal";
import { CustomerInfoModal } from "../components/CustomerInfoModal";
// import type { MenuItem } from "@/config/types/order";
import type { CustomerInfo } from "../data/types";
import PosPageSkeleton from "@/components/skeleton/PosPageSkeleton";
import { ScanSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function PosPage() {
  const { tableId } = useParams();
  // const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  // const [isLoading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(-1);
  
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const cart = useCart(tableId!);

  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const result = await api.get("/pos/menuitems/");
      if (!result.data.success) {
        throw new Error(result.data.message || "Failed to load menu items!");
      }
      return result.data.data ?? [];
    },
  });

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Failed to load menu items!");
    }
  }, [isError, error]);

  // useEffect(() => {
  //   async function fetchMenu() {
  //     try {
  //       const result = await api.get("/pos/menuitems/");
  //       if (result.data.success) {
  //         setMenuItems(result.data.data ?? []);
  //       } else {
  //         toast.error(result.data.message || "Failed to load menu items!");
  //       }
  //     } catch (err) {
  //       console.error("Failed to load menu items", err);
  //       toast.error("Failed to load menu items!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchMenu();
  // }, []);

  const filteredProducts = useMemo(
    () =>
      activeCategory === -1
        ? menuItems
        : menuItems.filter((p : MenuItem) => p.category === activeCategory),
    [activeCategory, menuItems]
  );

  const handlePay = useCallback(() => {
    if (!(cart.draftItemCount === 0 && cart.orderedItemCount !== 0)) return;
    setCustomerModalOpen(true);
  }, [cart]);

  const handleCustomerContinue = useCallback((cust: CustomerInfo) => {
    setCustomer(cust);
    setPaymentOpen(true);
  }, []);

  const handleComplete = useCallback(() => {
    setPaymentOpen(false);
    setCustomer(null);
    cart.clearOrdered();
    toast.success("Order completed!");
  }, [cart]);

  if (isLoading) return <PosPageSkeleton />;

  return (
    <div className="-m-4 md:-m-6 flex h-[calc(100svh-3.5rem)] flex-col">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading POS</h3>
          </div>
        </div>
      )}

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

        <div className="hidden w-[500px] shrink-0 border-l bg-card md:flex md:flex-col lg:w-[600px] xl:w-[650px]">
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

      <CustomerInfoModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onContinue={handleCustomerContinue}
      />

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        subtotal={cart.subtotal}
        orderedItems={cart.orderedItems}
        discountPercent={cart.discountPercent}
        discountAmount={cart.discountAmount}
        customer={customer}
        onComplete={handleComplete}
      />
    </div>
  );
}