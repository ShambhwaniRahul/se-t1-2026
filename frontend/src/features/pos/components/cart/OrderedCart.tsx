import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { OrderCartItem, GroupedOrderItem } from "../../data/posData";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface OrderedCartProps {
  orderedItems: OrderCartItem[];
}

export function OrderedCart({ orderedItems }: OrderedCartProps) {

  const groupedOrderedItems = useMemo(() => {
    const map = new Map<string, GroupedOrderItem>();

    for (const item of orderedItems) {

      if (!map.has(item.item_id)) {
        map.set(item.item_id, {
          item_id: item.item_id,
          name: item.name,
          price: item.price,
          items: []
        });
      }

      map.get(item.item_id)!.items.push(item);
    }

    return Array.from(map.values());

  }, [orderedItems]);

  if (orderedItems.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-bold">Ordered Cart</h2>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {orderedItems.length}
        </span>
      </div>

      <Separator />

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 p-2">

          {groupedOrderedItems.map((group) => (
            <div
              key={group.item_id}
              className="rounded-md px-2 py-2 hover:bg-accent/50"
            >

              <div className="flex justify-between">
                <p className="text-sm font-semibold">
                  {group.name} x{group.items.length}
                </p>

                <span className="text-sm font-medium">
                  ${(group.price * group.items.length).toFixed(2)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-1">

                {group.items.map((item) => (
                  <span
                    key={item.menu_item_id}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      item.status === "ready" && "bg-green-100 text-green-700",
                      item.status === "pending" && "bg-yellow-100 text-yellow-700",
                      item.status === "in-progress" && "bg-blue-100 text-blue-700"
                    )}
                  >
                    {item.status}
                  </span>
                ))}

              </div>

            </div>
          ))}

        </div>

        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <Separator />
    </>
  );
}