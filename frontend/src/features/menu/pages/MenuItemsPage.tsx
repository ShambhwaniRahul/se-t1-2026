import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItemFormSheet } from "../components/MenuItemFormSheet";
import { initialMenuItems } from "../data/mockMenuItems";
import { MENU_CATEGORIES, type MenuItem } from "../data/types";
import { toast } from "sonner";

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dietFilter, setDietFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (catFilter !== "all") result = result.filter((i) => i.categoryId === catFilter);
    if (dietFilter === "veg") result = result.filter((i) => i.isVeg);
    if (dietFilter === "non-veg") result = result.filter((i) => !i.isVeg);
    return result;
  }, [items, search, catFilter, dietFilter]);

  const categoryLabel = (id: string) => MENU_CATEGORIES.find((c) => c.id === id)?.label ?? id;

  const columns: Column<MenuItem>[] = [
    { key: "name", header: "Item Name" },
    { key: "category", header: "Category", render: (r) => categoryLabel(r.categoryId) },
    {
      key: "dietary", header: "Dietary",
      render: (r) => (
        <Badge variant="outline" className={r.isVeg
          ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
          : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
        }>
          {r.isVeg ? "Veg" : "Non-Veg"}
        </Badge>
      ),
    },
    { key: "price", header: "Price", render: (r) => `₹${r.price}` },
    { key: "prepTime", header: "Prep Time", render: (r) => `${r.estimatedPrepTime} mins` },
    {
      key: "actions", header: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditing(r); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleSave = (data: Omit<MenuItem, "id">) => {
    if (editing) {
      setItems((prev) => prev.map((i) => (i.id === editing.id ? { ...i, ...data } : i)));
      toast.success("Menu item updated");
    } else {
      const newItem: MenuItem = { ...data, id: `mi-${Date.now()}` };
      setItems((prev) => [newItem, ...prev]);
      toast.success("Menu item created");
    }
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.error("Menu item deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Menu Items"
        description="Manage your restaurant menu catalogue."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search items…" className="sm:w-72" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {MENU_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dietFilter} onValueChange={setDietFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Dietary" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="veg">Veg</SelectItem>
            <SelectItem value="non-veg">Non-Veg</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} />

      <MenuItemFormSheet open={formOpen} onOpenChange={setFormOpen} item={editing} onSave={handleSave} />

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Menu Item"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
