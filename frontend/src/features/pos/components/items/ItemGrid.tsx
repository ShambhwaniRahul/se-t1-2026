import { cn } from "@/lib/utils";
import type { MenuItem } from "@/config/types/order";

interface ItemGridProps {
  products: MenuItem[];
  onSelect: (product: MenuItem) => void;
}

export function ItemGrid({ products, onSelect }: ItemGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-1">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect(product)}
          className={cn(
            "group relative flex flex-col justify-between overflow-hidden text-left transition-all duration-300",
            "glass-panel rounded-2xl border border-border/50 p-4 min-h-[100px]",
            "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 active:scale-[0.97]"
          )}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <span className="relative z-10 text-sm font-semibold leading-tight text-foreground line-clamp-2">
            {product.name}
          </span>
          
          <div className="relative z-10 mt-auto flex w-full items-center justify-between pt-4">
            <div className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 text-sm font-bold text-emerald-600 shadow-sm transition-colors group-hover:bg-emerald-500/20">
              ₹{product.price.toFixed(2)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
