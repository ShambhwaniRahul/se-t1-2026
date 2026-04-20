import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import type { GroupedItem, OrderMenuItem } from "@/config/types/order";

type OrderedCartProps = {
  orderedItems: OrderMenuItem[];
};

export function OrderedCart({ orderedItems }:  OrderedCartProps) {

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
              key={group.menu_item.toString()}
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
                    key={item.id}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      item.menu_item_status_display.toLowerCase() === "ready" && "bg-green-100 text-green-700",
                      item.menu_item_status_display.toLowerCase() === "pending" && "bg-yellow-100 text-yellow-700",
                      item.menu_item_status_display.toLowerCase() === "in-progress" && "bg-blue-100 text-blue-700"
                    )}
                  >
                    {item.menu_item_status_display}
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