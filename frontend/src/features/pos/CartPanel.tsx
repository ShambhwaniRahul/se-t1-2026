import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { CartItem } from "./data";
import { cn } from "@/lib/utils";

interface CartPanelProps {
  items: CartItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onApplyDiscount: (percent: number) => void;
}

const QUICK_DISCOUNTS = [0, 5, 10, 15, 20];

export function CartPanel({
  items,
  subtotal,
  discountPercent,
  discountAmount,
  total,
  onUpdateQuantity,
  onRemove,
  onApplyDiscount,
}: CartPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-bold">Current Order</h2>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {items.reduce((s, i) => s + i.quantity, 0)}
        </span>
      </div>

      <Separator />

      {/* Items */}
      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Tap a product to start
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${item.product.price.toFixed(2)} ea
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <span className="w-16 text-right text-sm font-semibold">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(item.product.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Discount */}
      <div className="px-4 py-2">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Quick Discount</p>
        <div className="flex gap-1">
          {QUICK_DISCOUNTS.map((d) => (
            <button
              key={d}
              onClick={() => onApplyDiscount(d)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors min-h-[36px]",
                discountPercent === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {d === 0 ? "None" : `${d}%`}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-1 px-4 py-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discountPercent > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount ({discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg font-bold pt-1">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
