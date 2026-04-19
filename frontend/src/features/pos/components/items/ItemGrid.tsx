import { cn } from "@/lib/utils";
import type { MenuItem } from "@/config/types/order";

interface ItemGridProps {
  products: MenuItem[];
  onSelect: (product: MenuItem) => void;
}

export function ItemGrid({ products, onSelect }: ItemGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect(product)}
          className={cn(
            "group relative flex flex-col items-start justify-between rounded-lg border bg-card p-3 text-left transition-all",
            "min-h-[80px] active:scale-[0.97]",
            "hover:border-primary/40 hover:shadow-sm"
          )}
        >
          <span className="text-sm font-semibold leading-tight">{product.name}</span>
          <div className="mt-auto flex w-full items-end justify-between pt-1.5">
            <span className="text-base font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
