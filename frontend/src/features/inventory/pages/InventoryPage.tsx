import { useMemo, useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge, type StatusBadgeVariant } from "@/components/shared/StatusBadge";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, History, Pencil, Trash2 } from "lucide-react";
import { useInventory } from "../hooks/useInventory";
import { IngredientFormModal } from "../components/IngredientFormModal";
import { StockHistoryModal } from "../components/StockHistoryModal";
import type { Ingredient, IngredientCategory } from "../data/inventoryData";
import { INGREDIENT_CATEGORIES, getStockStatus } from "../data/inventoryData";

const STOCK_STATUS_MAP: Record<string, { label: string; variant: StatusBadgeVariant }> = {
  in_stock: { label: "In Stock", variant: "success" },
  low_stock: { label: "Low Stock", variant: "warning" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
};

export default function InventoryPage() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, getMovements } = useInventory();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Ingredient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Ingredient | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Filtered data
  const filtered = useMemo(() => {
    let result = ingredients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }
    if (stockFilter !== "all") {
      result = result.filter((i) => getStockStatus(i) === stockFilter);
    }
    return result;
  }, [ingredients, search, categoryFilter, stockFilter]);

  // Column defs
  const columns: Column<Ingredient>[] = useMemo(
    () => [
      { key: "name", header: "Ingredient", render: (i) => <span className="font-semibold">{i.name}</span> },
      {
        key: "category",
        header: "Category",
        render: (i) => (
          <span className="capitalize text-muted-foreground">
            {INGREDIENT_CATEGORIES.find((c) => c.id === i.category)?.label ?? i.category}
          </span>
        ),
      },
      {
        key: "currentStock",
        header: "Stock",
        render: (i) => (
          <span className="font-semibold tabular-nums">
            {i.currentStock} {i.unit}
          </span>
        ),
      },
      {
        key: "minStock",
        header: "Min",
        render: (i) => (
          <span className="tabular-nums text-muted-foreground">
            {i.minStock} {i.unit}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (i) => {
          const s = getStockStatus(i);
          const { label, variant } = STOCK_STATUS_MAP[s];
          return <StatusBadge variant={variant}>{label}</StatusBadge>;
        },
      },
      {
        key: "supplier",
        header: "Supplier",
        render: (i) => <span className="text-muted-foreground">{i.supplier}</span>,
      },
      {
        key: "costPerUnit",
        header: "Cost/Unit",
        render: (i) => <span className="tabular-nums">${i.costPerUnit.toFixed(2)}</span>,
      },
      {
        key: "actions",
        header: "",
        className: "w-[120px]",
        render: (i) => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setHistoryTarget(i); }}>
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(i); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(i); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Handlers
  const openAdd = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditTarget(ingredient);
    setFormOpen(true);
  };

  const handleSave = (data: Omit<Ingredient, "id">) => {
    if (editTarget) {
      updateIngredient(editTarget.id, data);
    } else {
      addIngredient(data);
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteIngredient(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const lowStockCount = ingredients.filter((i) => getStockStatus(i) !== "in_stock").length;

  return (
    <PageLayout>
      <PageHeader
        title="Inventory"
        description={`${ingredients.length} ingredients · ${lowStockCount} need attention`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAllHistory(true)}>
              <History className="mr-1 h-4 w-4" />
              History
            </Button>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Ingredient
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search ingredients or suppliers…"
          className="w-full sm:w-72"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INGREDIENT_CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable<Ingredient>
        columns={columns}
        data={filtered}
        keyExtractor={(i) => i.id}
        onRowClick={openEdit}
        emptyState={
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No ingredients match your filters.</p>
          </div>
        }
      />

      {/* Add/Edit modal */}
      <IngredientFormModal
        key={editTarget?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        ingredient={editTarget}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Ingredient"
        description={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Stock history – single ingredient */}
      <StockHistoryModal
        open={!!historyTarget}
        onOpenChange={(o) => !o && setHistoryTarget(null)}
        movements={historyTarget ? getMovements(historyTarget.id) : []}
        ingredientName={historyTarget?.name}
      />

      {/* Stock history – all */}
      <StockHistoryModal
        open={showAllHistory}
        onOpenChange={setShowAllHistory}
        movements={getMovements()}
      />
    </PageLayout>
  );
}
