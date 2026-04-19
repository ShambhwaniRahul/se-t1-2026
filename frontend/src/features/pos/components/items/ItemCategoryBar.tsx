import { cn } from "@/lib/utils";
import { type MenuCategory, CATEGORY_EMOJI_MAP } from "@/config/types/order";

interface ItemCategoryBarProps {
  categories: MenuCategory[];
  activeId: number;
  onSelect: (id: number) => void;
}

export function ItemCategoryBar({ categories, activeId, onSelect }: ItemCategoryBarProps) {
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
          <span className="text-base">{CATEGORY_EMOJI_MAP[cat.id]}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
