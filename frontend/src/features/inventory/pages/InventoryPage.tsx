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
import { Plus, Pencil, Trash2, ScanSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { getPerishableStatus } from "../utils/inventoryData";
import type { Ingredient } from "../data/type";
import {
  mapPerishableToIngredient,
  mapNonPerishableToIngredient,
} from "../data/mapper";
import api from "@/lib/api";
import { toast } from "sonner";
import { UpdateQuantityModal } from "../components/UpdateQuantityModal";
import { PerishableSkuModal } from "../components/PerishableSkuModal";

const STOCK_STATUS_MAP: Record<
  string,
  { label: string; variant: StatusBadgeVariant }
> = {
  in_stock: { label: "In Stock", variant: "success" },
  low_stock: { label: "Low Stock", variant: "warning" },
  out_of_stock: { label: "Out of Stock", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" }, 
  expiring_soon: { label: "Expiring Soon", variant: "warning" },
};

export default function InventoryPage() {
  const [type, setType] = useState<"perishable" | "non_perishable">("perishable");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Ingredient | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Ingredient | null>(null);
  const [skuModalOpen, setSkuModalOpen] = useState(false);

  /* Pagination State */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  /* Core fetch function configured to accept query parameters */
  const fetchInventory = async (
    selectedType = type,
    currentPage = page,
    currentSearch = search
  ) => {
    try {
      setLoading(true);

      const endpoint =
        selectedType === "perishable"
          ? "/inventory/perishable-inventory/"
          : "/inventory/non-perishable-inventory/";

      const res = await api.get(endpoint, {
        params: { page: currentPage, search: currentSearch },
      });

      const { results, next, previous, total_pages } = res.data.data;

      if (selectedType === "perishable") {
        const mapped = results.map(mapPerishableToIngredient);
        setIngredients(mapped);
      } else {
        const mapped = results.map(mapNonPerishableToIngredient);
        setIngredients(mapped);
      }

      setHasNextPage(next !== null);
      setHasPrevPage(previous !== null);
      setTotalPages(total_pages || 1);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  /* Debounced effect for handling search and pagination state changes */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventory(type, page, search);
    }, 400); 

    return () => clearTimeout(timeoutId);
  }, [type, page, search]);

  /* Handlers for state resets during navigation or searching */
  const handleTypeChange = (newType: "perishable" | "non_perishable") => {
    setType(newType);
    setPage(1);
    setSearch("");
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); 
  };

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

  const handleCreateSKU = async (data: any) => {
    try {
      const res = await api.post("/inventory/perishable-skus/", data);

      if (res.data.success) {
        toast.success(res.data.message || "SKU created successfully");
      } else {
        toast.error(res.data.message || "Failed to create SKU");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleUpdateQuantity = async (quantity: number) => {
    if (!updateTarget) return;

    try {
      let res;

      if (type === "perishable") {
        res = await api.patch(
          `/inventory/perishable-inventory/${updateTarget.id}/`,
          { quantity }
        );
      } else {
        res = await api.patch(
          `/inventory/non-perishable-inventory/${updateTarget.id}/`,
          { quantity }
        );
      }
      
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    let result;
    try {
      if (type === "perishable") {
        result = await api.delete(
          `/inventory/perishable-inventory/${deleteTarget.id}/`
        );
      } else {
        result = await api.delete(
          `/inventory/non-perishable-inventory/${deleteTarget.id}/`
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
        description={`${ingredients.length} items on this page`}
        actions={
          <Button onClick={() => setSkuModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            SKU
          </Button>
        }
      />

      <div className="flex gap-2">
        <Button
          variant={type === "perishable" ? "default" : "outline"}
          onClick={() => handleTypeChange("perishable")}
        >
          Perishable
        </Button>

        <Button
          variant={type === "non_perishable" ? "default" : "outline"}
          onClick={() => handleTypeChange("non_perishable")}
        >
          Non-Perishable
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={handleSearchChange}
        placeholder="Search inventory..."
        className="w-72"
      />

      <DataTable columns={columns} data={ingredients} keyExtractor={(i) => i.id} />

      {/* Pagination Controls Component */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t gap-4">
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
          
          <div className="flex items-center gap-2 border-l pl-3 ml-1">
            <span className="text-sm text-muted-foreground">Jump to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const requestedPage = parseInt(e.target.value, 10);
                if (!isNaN(requestedPage) && requestedPage >= 1 && requestedPage <= totalPages) {
                  setPage(requestedPage);
                }
              }}
              className="w-16 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete"
        description={`Delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      <UpdateQuantityModal
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        item={updateTarget}
        onSubmit={handleUpdateQuantity}
      />
      <PerishableSkuModal
        open={skuModalOpen}
        onOpenChange={setSkuModalOpen}
        onSubmit={handleCreateSKU}
      />
    </PageLayout>
  );
}