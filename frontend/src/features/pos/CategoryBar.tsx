import { cn } from "@/lib/utils";
import type { PosCategory } from "./data";

interface CategoryBarProps {
  categories: PosCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryBar({ categories, activeId, onSelect }: CategoryBarProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
            "min-h-[44px] min-w-[44px]", // touch target
            activeId === cat.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          <span className="text-base">{cat.emoji}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
