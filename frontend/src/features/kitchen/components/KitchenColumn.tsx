import type { KitchenItem, KitchenStatus } from "../data/kitchenData";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface KitchenColumnProps {
  id: KitchenStatus;
  label: string;
  items: KitchenItem[];
  onMove: (itemId: number, newStatus: KitchenStatus) => void;
  onDrop: (itemId: number, targetStatus: KitchenStatus) => void;
  onDragStart: (e: React.DragEvent, itemId: number) => void;
}

export function KitchenColumn({
  id,
  label,
  items,
  onMove,
  onDrop,
  onDragStart,
}: KitchenColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const itemId = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(itemId)) {
      onDrop(itemId, id);
    }
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

      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-extrabold tracking-tight text-foreground">
          {label}
        </h2>
        <Badge variant="secondary" className="text-base font-bold tabular-nums">
          {items.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {items.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-muted-foreground">
              No items
            </p>
          )}
          {items.map((item) => (
            <KitchenOrderCard
              key={item.id}
              item={item}
              onMove={onMove}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
