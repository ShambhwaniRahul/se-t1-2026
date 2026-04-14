import { useState, useMemo, useCallback } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { VendorFormSheet } from "../components/VendorFormSheet";
import { VendorDetailSheet } from "../components/VendorDetailSheet";
import { mockVendors, mockVendorPurchaseOrders } from "../data/mockVendors";
import type { Vendor, VendorFormValues } from "../data/types";
import { toast } from "sonner";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [search, setSearch] = useState("");

  // Form sheet state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Detail sheet state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        `${v.firstName} ${v.lastName}`.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q)
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
    (values: VendorFormValues) => {
      if (editingVendor) {
        setVendors((prev) =>
          prev.map((v) => (v.id === editingVendor.id ? { ...v, ...values } : v))
        );
        toast.success("Vendor updated successfully");
      } else {
        const newVendor: Vendor = { ...values, id: `v${Date.now()}` };
        setVendors((prev) => [newVendor, ...prev]);
        toast.success("Vendor added successfully");
      }
    },
    [editingVendor]
  );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setVendors((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    toast.success("Vendor deleted");
    setDeleteTarget(null);
  };

  const columns: Column<Vendor>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (row) => (
          <span className="font-medium">{row.firstName} {row.lastName}</span>
        ),
      },
      { key: "contactNo", header: "Contact No" },
      { key: "email", header: "Email" },
      {
        key: "gstNumber",
        header: "GST Number",
        render: (row) => <span className="font-mono text-xs">{row.gstNumber}</span>,
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleViewDetail(row); }}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const vendorOrders = useMemo(
    () => mockVendorPurchaseOrders.filter((po) => po.vendorId === selectedVendor?.id),
    [selectedVendor]
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
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
          <p className="text-center py-12 text-muted-foreground">No vendors found.</p>
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
        description={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
