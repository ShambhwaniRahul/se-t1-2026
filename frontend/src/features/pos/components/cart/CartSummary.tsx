import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const QUICK_DISCOUNTS = [0, 5, 10, 15, 20];

interface CartSummaryProps {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  onApplyDiscount: (percent: number) => void;
}

export function CartSummary({
  subtotal,
  discountPercent,
  discountAmount,
  total,
  onApplyDiscount
}: CartSummaryProps) {

  return (
    <>
      <Separator />

      <div className="px-4 py-2">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Quick Discount
        </p>

        <div className="flex gap-1">

          {QUICK_DISCOUNTS.map((d) => (
            <button
              key={d}
              onClick={() => onApplyDiscount(d)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-semibold",
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

      <div className="space-y-1 px-4 py-3 text-sm">

        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        {discountPercent > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discountPercent}%)</span>
            <span>-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-bold pt-1">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

      </div>
    </>
  );
}