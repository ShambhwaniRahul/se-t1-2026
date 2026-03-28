import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { DraftCartItem } from "../../data/posData";

interface DraftCartProps {
  draftItems: DraftCartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}

export function DraftCart({
  draftItems,
  onUpdateQuantity,
  onRemove,
}: DraftCartProps) {

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-bold">Draft Cart</h2>

        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {draftItems.reduce((s, i) => s + i.quantity, 0)}
        </span>
      </div>

      <Separator />
      
      <ScrollArea className="flex-1 min-h-0">

        {draftItems.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Tap a product to start
          </div>
        ) : (

          <div className="space-y-1 p-2">

            {draftItems.map((item) => (

              <div
                key={item.product.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/50"
              >

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.product.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    ${item.product.price.toFixed(2)} ea
                  </p>
                </div>

                <div className="flex items-center gap-1">

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>

                  <span className="w-6 text-center text-sm font-bold">
                    {item.quantity}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>

                </div>

                <span className="w-16 text-right text-sm font-semibold">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(item.product.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>

              </div>

            ))}

          </div>

        )}

        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </>
  );
}