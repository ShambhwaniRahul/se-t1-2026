import { useMemo, useState, useEffect } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/shared/StatusBadge";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ScanSearch } from "lucide-react";
import { getPerishableStatus } from "../utils/inventoryData";
import type { Ingredient } from "../data/type";
import {
  mapPerishableToIngredient,
  mapNonPerishableToIngredient,
} from "../data/mapper";
import api from "@/lib/api";
import { toast } from "sonner";
import { UpdateQuantityModal } from "../components/UpdateQuantityModal";

const STOCK_STATUS_MAP: Record<
  string,
  { label: string; variant: StatusBadgeVariant }
> = {
  in_stock: { label: "In Stock", variant: "success" },
  low_stock: { label: "Low Stock", variant: "warning" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },

  // 🔥 NEW
  expired: { label: "Expired", variant: "secondary" }, // grey
  expiring_soon: { label: "Expiring Soon", variant: "warning" },
};

export default function InventoryPage() {
  const [type, setType] = useState<"perishable" | "non_perishable">(
    "perishable",
  );

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Ingredient | null>(null);

  // 🔥 FETCH BASED ON TYPE
  const fetchInventory = async (selectedType = type) => {
    try {
      setLoading(true);

      if (selectedType === "perishable") {
        const res = await api.get("/inventory/perishable-inventory/");
        const mapped = res.data.data.map(mapPerishableToIngredient);
        setIngredients(mapped);
      } else {
        const res = await api.get("/inventory/non-perishable-inventory/");
        const mapped = res.data.data.map(mapNonPerishableToIngredient);
        setIngredients(mapped);
      }
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [type]);

  // 🔍 FILTER
  const filtered = useMemo(() => {
    if (!search) return ingredients;
    const q = search.toLowerCase();
    return ingredients.filter((i) => i.name.toLowerCase().includes(q));
  }, [ingredients, search]);

  // 🧾 COLUMNS (dynamic)
  const columns: Column<Ingredient>[] = useMemo(() => {
    const base: Column<Ingredient>[] = [
      {
        key: "name",
        header: "Name",
        render: (i) => <span className="font-semibold">{i.name}</span>,
      },
      {
        key: "quantity",
        header: "Stock",
        render: (i) => (
          <span className="font-semibold">
            {i.quantity} {i.unit}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (i) => {
          let status;

          if (i.category === "perishable") {
            status = getPerishableStatus(i);
          } else {
            status = "in_stock";
          }
          const { label, variant } = STOCK_STATUS_MAP[status];

          return <StatusBadge variant={variant}>{label}</StatusBadge>;
        },
      },
    ];

    // 👉 Add expiry column only for perishable
    if (type === "perishable") {
      base.push({
        key: "expiry",
        header: "Expiry",
        render: (i) => (
          <span className={i.isExpired ? "text-destructive" : ""}>
            {i.expiryDate ?? "-"}
          </span>
        ),
      });
    }

    // 👉 Actions
    base.push({
      key: "actions",
      header: "",
      render: (i) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setUpdateTarget(i)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => setDeleteTarget(i)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    });

    return base;
  }, [type]);

  // 🖊 EDIT
  const handleUpdateQuantity = async (quantity: number) => {
    if (!updateTarget) return;

    try {
      let res;

      if (type === "perishable") {
        res = await api.patch(
          `/inventory/perishable-inventory/${updateTarget.id}/`,
          { quantity },
        );
      } else {
        res = await api.patch(
          `/inventory/non-perishable-inventory/${updateTarget.id}/`,
          { quantity },
        );
      }
      console.log("✅✅Res: ",res.data);
      if (res.data.success) {
        toast.success(res.data.message || "Quantity updated");

        fetchInventory();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch { 
      toast.error("Failed to update");
    } finally {
      setUpdateTarget(null);
    }
  };

  // 🗑 DELETE
  const handleDelete = async () => {
    if (!deleteTarget) return;
    let result;
    try {
      if (type === "perishable") {
        result = await api.delete(
          `/inventory/perishable-inventory/${deleteTarget.id}/`,
        );
      } else {
        result = await api.delete(
          `/inventory/non-perishable-inventory/${deleteTarget.id}/`,
        );
      }

      if (result.data.success) {
        toast.success(result.data.message || "Deleted");
        fetchInventory();
      } else {
        toast.error(result.data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <PageLayout>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Inventory</h3>
          </div>
        </div>
      )}

      <PageHeader
        title="Inventory"
        description={`${ingredients.length} items`}
        actions={
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        }
      />

      {/* 🔥 TOGGLE BUTTONS */}
      <div className="flex gap-2">
        <Button
          variant={type === "perishable" ? "default" : "outline"}
          onClick={() => setType("perishable")}
        >
          Perishable
        </Button>

        <Button
          variant={type === "non_perishable" ? "default" : "outline"}
          onClick={() => setType("non_perishable")}
        >
          Non-Perishable
        </Button>
      </div>

      {/* 🔍 SEARCH */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search..."
        className="w-72"
      />

      {/* TABLE */}
      <DataTable columns={columns} data={filtered} keyExtractor={(i) => i.id} />

      {/* DELETE */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete"
        description={`Delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* EDIT - REUSE ADD DIALOG WITH PRE-FILLED DATA */}
      <UpdateQuantityModal
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        item={updateTarget}
        onSubmit={handleUpdateQuantity}
      />
    </PageLayout>
  );
}