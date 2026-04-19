import { DraftCart } from "./DraftCart";
import { OrderedCart } from "./OrderedCart";
import { CartSummary } from "./CartSummary";
import type { DraftCartItem, OrderMenuItem } from "@/config/types/order";

interface CartPanelProps {
  orderedItems: OrderMenuItem[];
  draftItems: DraftCartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  onApplyDiscount: (percent: number) => void;
}

export function CartPanel(props: CartPanelProps) {

  return (
    <div className="flex h-full flex-col min-h-0">

      <OrderedCart orderedItems={props.orderedItems} />

      <DraftCart
        draftItems={props.draftItems}
        onUpdateQuantity={props.onUpdateQuantity}
        onRemove={props.onRemove}
      />

      <CartSummary
        subtotal={props.subtotal}
        discountPercent={props.discountPercent}
        discountAmount={props.discountAmount}
        total={props.total}
        onApplyDiscount={props.onApplyDiscount}
      />

    </div>
  );
}