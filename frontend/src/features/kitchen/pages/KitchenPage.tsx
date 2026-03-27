import { KITCHEN_COLUMNS } from "../data/kitchenData";
import { useKitchenOrders } from "../hooks/useKitchenOrders";
import { KitchenColumn } from "../components/KitchenColumn";
import { useCallback } from "react";
import type { KitchenOrderStatus } from "../data/kitchenData";

export default function KitchenPage() {
  const { moveOrder, getOrdersByStatus } = useKitchenOrders();

  const handleDragStart = useCallback((e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData("text/plain", orderId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDrop = useCallback(
    (orderId: string, targetStatus: KitchenOrderStatus) => {
      moveOrder(orderId, targetStatus);
    },
    [moveOrder]
  );

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Kitchen Display
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Drag orders between columns or use action buttons
        </p>
      </div>

      {/* Kanban board */}
      <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
        {KITCHEN_COLUMNS.map((col) => (
          <KitchenColumn
            key={col.id}
            id={col.id}
            label={col.label}
            orders={getOrdersByStatus(col.id)}
            onMove={moveOrder}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}
