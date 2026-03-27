import type { KitchenOrder, KitchenOrderStatus } from "./kitchenData";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface KitchenColumnProps {
  id: KitchenOrderStatus;
  label: string;
  orders: KitchenOrder[];
  onMove: (orderId: string, newStatus: KitchenOrderStatus) => void;
  onDrop: (orderId: string, targetStatus: KitchenOrderStatus) => void;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
}

export function KitchenColumn({
  id,
  label,
  orders,
  onMove,
  onDrop,
  onDragStart,
}: KitchenColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const orderId = e.dataTransfer.getData("text/plain");
    if (orderId) onDrop(orderId, id);
  };

  return (
    <div
      className={[
        "flex min-w-[300px] flex-1 flex-col rounded-xl border-2 transition-colors",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/30",
      ].join(" ")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-extrabold tracking-tight text-foreground">
          {label}
        </h2>
        <Badge variant="secondary" className="text-base font-bold tabular-nums">
          {orders.length}
        </Badge>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {orders.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-muted-foreground">
              No orders
            </p>
          )}
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onMove={onMove}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
