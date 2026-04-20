import type { KitchenStatus } from "../data/kitchenData";
import { ElapsedTimer } from "./ElapsedTimer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import type {OrderMenuItem}  from "@/config/types/order";

type KitchenItem = OrderMenuItem & {
  status: KitchenStatus;
};

interface KitchenOrderCardProps {
  item: KitchenItem;
  onMove: (itemId: number, newStatus: KitchenStatus) => void;
  onDragStart: (e: React.DragEvent, itemId: number) => void;
}

const NEXT_STATUS: Record<KitchenStatus, KitchenStatus | null> = {
  pending: "in_progress",
  in_progress: "ready",
  ready: "served",
  served: null,
  cancelled: null,
  rejected: null,
};

const ACTION_LABELS: Record<KitchenStatus, string> = {
  pending: "Start",
  in_progress: "Mark Ready",
  ready: "Serve",
  served: "",
  cancelled: "",
  rejected: "",
};

export function KitchenOrderCard({ item, onMove, onDragStart }: KitchenOrderCardProps) {
  const next = NEXT_STATUS[item.status];

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}

      className="cursor-grab border-2 border-border bg-card transition-shadow hover:shadow-lg active:cursor-grabbing"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          {item.menu_item_name}
        </span>
        <ElapsedTimer since={Date.parse(item.created_at)} />
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">

        {item.chef_name && (
          <p className="text-sm text-muted-foreground">
            Chef: {item.chef_name}
          </p>
        )}


        {item.special_instructions && (
          <div className="flex items-start gap-2 rounded-md bg-warning/15 p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-sm font-semibold text-warning">
              {item.special_instructions}
            </p>
          </div>
        )}

        {next && (
          <Button
            size="lg"
            className="w-full text-base font-bold"
            variant={item.status === "in_progress" ? "default" : "secondary"}
            onClick={() => onMove(item.id, next)}
          >
            {item.status === "in_progress" ? (
              <Check className="mr-1 h-5 w-5" />
            ) : (
              <ArrowRight className="mr-1 h-5 w-5" />
            )}
            {ACTION_LABELS[item.status]}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
