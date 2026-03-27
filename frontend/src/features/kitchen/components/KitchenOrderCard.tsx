import type { KitchenOrder, KitchenOrderStatus } from "../data/kitchenData";
import { ElapsedTimer } from "./ElapsedTimer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onMove: (orderId: string, newStatus: KitchenOrderStatus) => void;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
}

const NEXT_STATUS: Record<KitchenOrderStatus, KitchenOrderStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: null,
};

const ACTION_LABELS: Record<KitchenOrderStatus, string> = {
  new: "Start",
  preparing: "Ready",
  ready: "",
};

export function KitchenOrderCard({ order, onMove, onDragStart }: KitchenOrderCardProps) {
  const next = NEXT_STATUS[order.status];

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, order.id)}
      className="cursor-grab border-2 border-border bg-card transition-shadow hover:shadow-lg active:cursor-grabbing"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          {order.orderNumber}
        </span>
        <ElapsedTimer since={order.createdAt} />
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        {/* Items */}
        <ul className="space-y-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-baseline gap-2 text-base">
              <span className="min-w-[1.75rem] text-right font-bold text-foreground">
                {item.quantity}×
              </span>
              <span className="font-medium text-foreground">{item.name}</span>
              {item.notes && (
                <span className="text-sm text-muted-foreground">({item.notes})</span>
              )}
            </li>
          ))}
        </ul>

        {/* Special instructions */}
        {order.specialInstructions && (
          <div className="flex items-start gap-2 rounded-md bg-warning/15 p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm font-semibold text-warning">
              {order.specialInstructions}
            </p>
          </div>
        )}

        {/* Action button */}
        {next && (
          <Button
            size="lg"
            className="w-full text-base font-bold"
            variant={order.status === "preparing" ? "default" : "secondary"}
            onClick={() => onMove(order.id, next)}
          >
            {order.status === "preparing" ? (
              <Check className="mr-1 h-5 w-5" />
            ) : (
              <ArrowRight className="mr-1 h-5 w-5" />
            )}
            {ACTION_LABELS[order.status]}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
