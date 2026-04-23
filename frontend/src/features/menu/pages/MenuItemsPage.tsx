import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, ScanSearch } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItemFormSheet } from "../components/MenuItemFormSheet";
import { type MenuItem } from "../../../config/types/order";
import { toast } from "sonner";
import { mapToMenuItem, mapToApiPayload } from "../utils/mapper";
import api from "@/lib/api";

// Sequential messages displayed during the 20s data synchronization phase
const PROCESSING_STEPS = [
  "Fetching menu catalogue...",
  "Syncing item categories...",
  "Updating pricing models...",
  "Resolving dietary tags...",
  "Finalizing menu data..."
];

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dietFilter, setDietFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);

  // States for handling the extended AI/data processing UI
  const [isProcessing, setIsProcessing] = useState(true);
  const [processStep, setProcessStep] = useState(0);

  // Cycles through processing messages every 4 seconds to cover the long response time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setProcessStep(0);
      interval = setInterval(() => {
        setProcessStep((prev) =>
          prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (catFilter !== "all") {
      result = result.filter(item => item.category_name === catFilter);
    }
    if (dietFilter === "veg") result = result.filter((i) => i.is_veg);
    if (dietFilter === "non-veg") result = result.filter((i) => !i.is_veg);
    return result;
  }, [items, search, catFilter, dietFilter]);

  const columns: Column<MenuItem>[] = [
    { key: "name", header: "Item Name" },
    { key: "category", header: "Category", render: (r) => r.category_name },
    {
      key: "dietary", header: "Dietary",
      render: (r) => (
        <Badge variant="outline" className={r.is_veg
          ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
          : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
        }>
          {r.is_veg ? "Veg" : "Non-Veg"}
        </Badge>
      ),
    },
    { key: "price", header: "Price", render: (r) => `₹${r.price}` },
    { key: "prepTime", header: "Prep Time", render: (r) => `${r.estimated_prep_time} mins` },
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

  const fetchItems = async () => {
    try {
      setIsProcessing(true);
      const res = await api.get("/pos/menuitems/");
      const mapped = res.data.data.map(mapToMenuItem);
      setItems(mapped);
    } catch (err) {
      toast.error("Failed to load menu items");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const payload = mapToApiPayload(data);

      if (editing) {
        await api.patch(`/pos/menuitems/${editing.id}/`, payload);
        toast.success("Menu item updated");
      } else {
        await api.post("/pos/menuitems/", payload);
        toast.success("Menu item created");
      }

      await fetchItems();
      setEditing(null);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/pos/menuitems/${deleteTarget.id}/`);
      toast.success("Menu item deleted");

      await fetchItems(); // 🔥 refresh data
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Full-screen blocking overlay active during long data synchronization */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold mb-2">Loading Menu</h3>
            <p className="text-sm text-muted-foreground animate-pulse h-6">
              {PROCESSING_STEPS[processStep]}
            </p>
          </div>
        </div>
      )}

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
            {Array.from(new Set(items.map(i => i.category_name).filter(Boolean))).map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
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