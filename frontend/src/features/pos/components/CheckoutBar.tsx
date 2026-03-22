import { CreditCard, IndianRupee, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CheckoutBarProps {
  total: number;
  orderedItemCount: number;
  draftItemCount: number;
  onPay: () => void;
  onClear: () => void;
  submitDraft: () => void;
}

export function CheckoutBar({ total, orderedItemCount, draftItemCount, onPay, onClear, submitDraft }: CheckoutBarProps) {
  const disableDraftActions = draftItemCount === 0;
  const disablePay = !(draftItemCount === 0 && orderedItemCount !== 0);

  return (
    <div className="flex items-center gap-2 border-t bg-card px-4 py-3">
      <Button
        variant="secondary"
        className="min-h-[48px] flex-1 gap-2"
        disabled={disablePay}
        onClick={onPay}
      >
        <IndianRupee className="h-4 w-4" />
        Cash
      </Button>

      <Button
        className="min-h-[48px] flex-[2] gap-2 text-base font-bold"
        disabled={disablePay}
        onClick={onPay}
      >
        <CreditCard className="h-5 w-5" />
        Pay {total.toFixed(2)}
        <kbd className="ml-1 hidden rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 py-0.5 text-[10px] font-mono lg:inline-block">
          Enter
        </kbd>
      </Button>

      <Button
        variant="outline"
        className="min-h-[48px] gap-2 flex-1"
        onClick={submitDraft}
        disabled={disableDraftActions}
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Order</span>
      </Button>

      <Button
        variant="outline"
        className="min-h-[48px] gap-2"
        onClick={onClear}
        disabled={disableDraftActions}
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Clear</span>
      </Button>
    </div>
  );
}
