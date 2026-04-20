import { KITCHEN_COLUMNS } from "../data/kitchenData";
import { useKitchenOrders } from "../hooks/useKitchenOrders";
import { KitchenColumn } from "../components/KitchenColumn";
import { useCallback } from "react";
import type { KitchenStatus } from "../data/kitchenData";

export default function KitchenPage() {
  const { moveItem, getItemsByStatus } = useKitchenOrders();

  const handleDragStart = useCallback((e: React.DragEvent, itemId: number) => {
    e.dataTransfer.setData("text/plain", String(itemId));
    e.dataTransfer.effectAllowed = "move";
  }, []);


  const handleDrop = useCallback(
    (itemId: number, targetStatus: KitchenStatus) => {
      moveItem(itemId, targetStatus);
    },
    [moveItem]
  );

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Kitchen Display
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Drag items between columns or use action buttons
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
        {KITCHEN_COLUMNS.map((col) => (
          <KitchenColumn
            key={col.id}
            id={col.id}
            label={col.label}
            items={getItemsByStatus(col.id)}
            onMove={moveItem}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
}