import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Eye, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { VendorFormSheet } from "../components/VendorFormSheet";
import { VendorDetailSheet } from "../components/VendorDetailSheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Vendor,
  VendorFormValues,
  VendorPurchaseOrder,
} from "../../../config/types/vendor";
import { toast } from "sonner";

/* ================= API ================= */

const fetchVendors = async (): Promise<Vendor[]> => {
  const res = await api.get("/procurement/vendors/");
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

const fetchVendorOrders = async (
  vendorId: number
): Promise<VendorPurchaseOrder[]> => {
  const res = await api.get(
    `/procurement/vendors/${vendorId}/purchase-orders/`
  );
  if (!res.data.success) throw new Error(res.data.message);
  return res.data.data;
};

/* ================= PAGE ================= */

export default function VendorsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  /* ================= FETCH VENDORS ================= */

  const {
    data: vendors = [],
    isLoading,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
  });

  /* ================= FETCH ORDERS ================= */

  const {
    data: vendorOrders = [],
    isLoading: ordersLoading,
  } = useQuery({
    queryKey: ["vendor-orders", selectedVendor?.id],
    queryFn: () => fetchVendorOrders(selectedVendor!.id),
    enabled: !!selectedVendor,
  });

  /* ================= MUTATIONS ================= */

  const createVendor = useMutation({
    mutationFn: (values: VendorFormValues) =>
      api.post("/procurement/vendors/", values),
    onSuccess: (res) => {
      toast.success(res.data.message || "Vendor added");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: () => toast.error("Failed to add vendor"),
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, values }: { id: number; values: VendorFormValues }) =>
      api.patch(`/procurement/vendors/${id}/`, values),
    onSuccess: (res) => {
      toast.success(res.data.message || "Vendor updated");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: () => toast.error("Failed to update vendor"),
  });

  const deleteVendor = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/procurement/vendors/${id}/`),
    onSuccess: (res) => {
      toast.success(res.data.message || "Vendor deleted");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: () => toast.error("Failed to delete vendor"),
  });

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return vendors;

    return vendors.filter(
      (v) =>
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  /* ================= ACTIONS ================= */

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

  const handleFormSubmit = (values: VendorFormValues) => {
    if (editingVendor) {
      updateVendor.mutate({ id: editingVendor.id, values });
    } else {
      createVendor.mutate(values);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteVendor.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  /* ================= TABLE ================= */

  const columns: Column<Vendor>[] = [
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
            className="text-destructive"
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
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* LOADER */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center">
            <ScanSearch className="h-12 w-12 animate-pulse mb-6" />
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
        loading={ordersLoading}
      />

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Vendor"
        description={`Are you sure you want to delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
