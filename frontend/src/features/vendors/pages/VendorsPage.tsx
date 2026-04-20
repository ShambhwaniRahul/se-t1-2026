import { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { VendorFormSheet } from "../components/VendorFormSheet";
import { VendorDetailSheet } from "../components/VendorDetailSheet";
// import { mockVendorPurchaseOrders } from "../data/mockVendors";
import api from "@/lib/api";
import type {
  Vendor,
  VendorFormValues,
  VendorPurchaseOrder,
} from "../../../config/types/vendor";
import { toast } from "sonner";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Form sheet state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Detail sheet state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  // For the Vendor's Purchase Orders
  const [vendorOrders, setVendorOrders] = useState<
    VendorPurchaseOrder[] | null
  >(null);
  const [ordersLoading, setOrdersLoading] = useState(false); // optional but good

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Simulate API call
      const result = await api.get("/procurement/vendors");
      if (result.data.success) {
        setVendors(result.data.data);
        toast.success(result.data.message || "Vendors fetched successfully");
      } else {
        toast.error(result.data.message || "Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorOrders = async (vendorId: number) => {
    setOrdersLoading(true);
    try {
      const result = await api.get(
        `/procurement/vendors/${vendorId}/purchase-orders/`,
      );
      if (result.data.success) {
        setVendorOrders(result.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendor purchase orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVendor) {
      fetchVendorOrders(selectedVendor.id);
    } else {
      setVendorOrders(null);
    }
  }, [selectedVendor]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q),
    );
  }, [vendors, search]);

  const handleAdd = () => {
    setEditingVendor(null);
    setFormOpen(true);
  };

  const handleEdit = (v: Vendor) => {
    setEditingVendor(v);
    setFormOpen(true);
  };

  const handleViewDetail = (v: Vendor) => {
    setSelectedVendor(v);
    setDetailOpen(true);
  };

  const handleFormSubmit = useCallback(
    async (values: VendorFormValues) => {
      if (editingVendor) {
        // Simulate API call
        try {
          const result = await api.patch(
            `/procurement/vendors/${editingVendor.id}/`,
            values,
          );
          if (result.data.success) {
            toast.success(result.data.message || "Vendor updated successfully");
          } else {
            toast.error(result.data.message || "Failed to update vendor");
          }
        } catch (error) {
          toast.error("Failed to update vendor");
        } finally {
          fetchVendors();
        }
      } else {
        // Simulate API call
        try {
          const result = await api.post("/procurement/vendors/", values);
          if (result.data.success) {
            toast.success(result.data.message || "Vendor added successfully");
          } else {
            toast.error(result.data.message || "Failed to add vendor");
          }
        } catch (error) {
          toast.error("Failed to add vendor");
        } finally {
          fetchVendors();
        }
      }
    },
    [editingVendor],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setVendors((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    toast.success("Vendor deleted");
    try {
      const result = await api.delete(
        `/procurement/vendors/${deleteTarget.id}/`,
      );
      if (result.data.success) {
        toast.success(result.data.message || "Vendor deleted successfully");
      } else {
        toast.error(result.data.message || "Failed to delete vendor");
      }
    } catch (error) {
      toast.error("Failed to delete vendor");
    } finally {
      fetchVendors();
      setDeleteTarget(null);
    }
  };

  const columns: Column<Vendor>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (row) => (
          <span className="font-medium">
            {row.first_name} {row.last_name}
          </span>
        ),
      },
      { key: "contact_no", header: "Contact No" },
      { key: "email", header: "Email" },
      {
        key: "gst_no",
        header: "GST Number",
        render: (row) => (
          <span className="font-mono text-xs">{row.gst_no}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(row);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Vendors</h3>
          </div>
        </div>
      )}

      <PageHeader
        title="Vendors"
        description="Manage your supplier relationships"
        actions={
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Vendor
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by name or email…"
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(row) => row.id}
        onRowClick={handleViewDetail}
        emptyState={
          <p className="text-center py-12 text-muted-foreground">
            No vendors found.
          </p>
        }
      />

      <VendorFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        vendor={editingVendor}
        onSubmit={handleFormSubmit}
      />

      <VendorDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        vendor={selectedVendor}
        purchaseOrders={vendorOrders}
      />

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Vendor"
        description={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}