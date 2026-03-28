import { Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onComplete: () => void;
}

export function PaymentModal({ open, onOpenChange, total, onComplete }: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>Process payment for this order</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          <div className="rounded-full bg-success/15 p-4">
            <Check className="h-10 w-10 text-success" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">${total.toFixed(2)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Payment received (mock)</p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1 gap-2 min-h-[44px]" onClick={onComplete}>
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Button className="flex-1 min-h-[44px]" onClick={onComplete}>
            New Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
