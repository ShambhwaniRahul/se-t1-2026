import { DraftCart } from "./DraftCart";
import { OrderedCart } from "./OrderedCart";
import { CartSummary } from "./CartSummary";
import type { DraftCartItem, OrderMenuItem } from "@/config/types/order";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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
  const hasOrderedItems = props.orderedItems.length > 0;

  return (
    <div className="flex h-full flex-col min-h-0">
      
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {hasOrderedItems && (
          <>
            <ResizablePanel 
              defaultSize={35} 
              minSize={20} 
              collapsible={true} 
              collapsedSize={0} 
              className="flex flex-col min-h-0"
            >
              <OrderedCart orderedItems={props.orderedItems} />
            </ResizablePanel>

            <ResizableHandle withHandle className="hover:bg-primary/20 transition-colors" />
          </>
        )}

        <ResizablePanel 
          defaultSize={hasOrderedItems ? 65 : 100} 
          minSize={20} 
          collapsible={true} 
          collapsedSize={0} 
          className="flex flex-col min-h-0"
        >
          <DraftCart
            draftItems={props.draftItems}
            onUpdateQuantity={props.onUpdateQuantity}
            onRemove={props.onRemove}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

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