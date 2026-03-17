import { CreditCard, DollarSign, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutBarProps {
  total: number;
  itemCount: number;
  onPay: () => void;
  onClear: () => void;
}

export function CheckoutBar({ total, itemCount, onPay, onClear }: CheckoutBarProps) {
  const disabled = itemCount === 0;

  return (
    <div className="flex items-center gap-2 border-t bg-card px-4 py-3">
      <Button
        variant="outline"
        className="min-h-[48px] gap-2"
        onClick={onClear}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Clear</span>
      </Button>

      <Button
        variant="secondary"
        className="min-h-[48px] flex-1 gap-2"
        disabled={disabled}
        onClick={onPay}
      >
        <DollarSign className="h-4 w-4" />
        Cash
      </Button>

      <Button
        className="min-h-[48px] flex-[2] gap-2 text-base font-bold"
        disabled={disabled}
        onClick={onPay}
      >
        <CreditCard className="h-5 w-5" />
        Pay ${total.toFixed(2)}
        <kbd className="ml-1 hidden rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 py-0.5 text-[10px] font-mono lg:inline-block">
          Enter
        </kbd>
      </Button>
    </div>
  );
}
