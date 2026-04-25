import { Printer, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import type { GroupedItem, OrderMenuItem } from "@/config/types/order";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {generateReceiptPdf} from "../receiptPdf.ts";
import type { CustomerInfo } from "../data/types";
// import { Switch } from "@/components/ui/switch";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  orderedItems: OrderMenuItem[];
  customer: CustomerInfo | null;
  onComplete: () => void;
}

export function PaymentModal({ 
  open, 
  onOpenChange, 
  subtotal, 
  discountPercent,
  discountAmount, 
  customer, 
  orderedItems, 
  onComplete }: Props) {
  
  const POINT_VALUE = 1; // 1 point = $1
  const [loading, setLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(true);

  const maxRedeemablePoints = customer
    ? customer.total_points : 0;

  const pointsApplied = redeemPoints ? maxRedeemablePoints : 0;
  console.log(">>> Points applied: ", pointsApplied)
  const loyaltyValue = pointsApplied * POINT_VALUE;
  console.log(">>> Loyalty Points: ", loyaltyValue)
  const total = Math.max(subtotal - loyaltyValue, 0);
  console.log(">>> Total after points: ", total);
  const finalTotal = (total - (total * discountPercent)/100);
  console.log(">>> Total after discount: ", finalTotal);
  const pointsEarned = Math.floor(finalTotal * 0.02);
  console.log(">>> Points Earned: ", pointsEarned)

  const groupedOrderedItems = useMemo(() => {
    const map = new Map<string, GroupedItem>();

    for (const item of orderedItems) {
      if (!map.has(item.menu_item.toString())) {
        map.set(item.menu_item.toString(), {
          menu_item: item.menu_item,
          name: item.menu_item_name,
          price: item.price_at_time,
          items: [],
        });
      }

      map.get(item.menu_item.toString())!.items.push(item);
    }

    return Array.from(map.values());
  }, [orderedItems]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log(">>> PAYLOAD: ",{
        payment_mode: 0,
        order: orderedItems[0].order,
        customer: customer?.id,
        discount: discountPercent,
        is_redeeming: redeemPoints,
      } )
      const result = await api.post("/customers/payments/", {
        payment_mode: 0,
        order: orderedItems[0].order,
        customer: customer?.id,
        discount: discountPercent,
        is_redeeming: redeemPoints,
      });

      if (result.data.success){
        toast.success(result.data.message || "Payment successful");
        generateReceiptPdf({
          items: groupedOrderedItems,
          subtotal,
          discountPercent,
          discountAmount: (total * discountPercent)/100,
          loyaltyPointsApplied: pointsApplied,
          loyaltyValue,
          finalTotal,
          pointsEarned,
          customer,
        });
        onComplete();
      } else {
        toast.error(result.data.message || "Payment failed!");
        console.log("Payment failed! ", result.data.message);
      }
    } catch (err) {
      toast.error("Payment failed!");
      console.log("Payment failed! ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order summary & payment</DialogTitle>
          <DialogDescription>Review the order before completing payment.</DialogDescription>
        </DialogHeader>

        {/* Customer */}
        {customer && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{customer.phone_no}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Loyalty</p>
              <p className="text-sm font-semibold">{customer.total_points} pts</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Items 
          </div>
          <Separator />
            <ScrollArea className="h-44">
              <div className="pr-3">
                <ul className="divide-y">
                  {groupedOrderedItems.map((item) => (
                    <li key={item.menu_item.toString()} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className="flex h-6 min-w-6 items-center justify-center rounded bg-secondary px-1.5 text-xs font-bold text-secondary-foreground">
                        {item.items.length}x
                      </span>
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="font-medium tabular-nums">
                      ₹{(item.price * item.items.length).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
        </div>

        {/* Loyalty redemption */}
        {customer && customer.total_points > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Redeem loyalty points</p>
                <p className="text-xs text-muted-foreground">
                  Up to {Math.min(customer.total_points, Math.floor(total / POINT_VALUE))} pts (₹
                  {(Math.min(customer.total_points, Math.floor(total / POINT_VALUE)) * POINT_VALUE).toFixed(2)})
                </p>
              </div>
            </div>
            <Switch checked={redeemPoints} onCheckedChange={setRedeemPoints} />
          </div>
        )}

        {/* Totals */}
        <div className="space-y-1.5 rounded-lg bg-muted/30 px-3 py-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">₹{subtotal.toFixed(2)}</span>
          </div>

          {customer && customer.total_points > 0 && (
            <div className="flex justify-between text-success">
              <span>Loyalty ({customer.total_points} pts)</span>
              <span className="tabular-nums">-₹{loyaltyValue.toFixed(2)}</span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({discountPercent}%)</span>
              <span className="tabular-nums">-₹{((total * discountPercent)/100).toFixed(2)}</span>
            </div>
          )}

          
          <Separator className="my-1" />
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold">Net Total</span>
            <span className="text-2xl font-bold tabular-nums">₹{finalTotal.toFixed(2)}</span>
          </div>
          {customer && pointsEarned > 0 && (
            <p className="pt-1 text-right text-xs text-muted-foreground">
              + {pointsEarned} pts earned on this order
            </p>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button className="flex-1 min-h-[44px]" onClick={handlePayment}>
            Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

