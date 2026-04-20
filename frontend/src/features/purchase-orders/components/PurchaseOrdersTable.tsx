import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/shared/StatusBadge";
import type { VendorPurchaseOrder, POStatus } from "@/config/types/vendor";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

const STATUS_MAP: Record<
  POStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  Pending: { label: "Pending", variant: "warning" },
  Received: { label: "Delivered", variant: "success" },
  Cancelled: { label: "Cancelled", variant: "destructive" },
};

interface Props {
  data: VendorPurchaseOrder[];
}

export function PurchaseOrdersTable({ data }: Props) {
  const navigate = useNavigate();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);


  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setOpenDelete(true);
  };



  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const res = await api.delete(
        `/procurement/purchase-orders/${selectedId}/`
      );

      if (res.data.success) {
        toast.success("Purchase order deleted");
        setOpenDelete(false);
        setSelectedId(null);
        window.location.reload();
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
  console.error(err);

  if (err.response) {
    // Backend ne response bheja hai (403, 400 etc.)
    const status = err.response.status;
    const message = err.response.data?.message;

    if (status === 403) {
      toast.error(message || "You are not allowed to perform this action");
    } else if (status === 400) {
      toast.error(message || "Bad request");
    } else {
      toast.error(message || "Something went wrong");
    }
  } else {
    // Network error
    toast.error("Network error");
  }
}
finally{
  setOpenDelete(false);
  setSelectedId(null);
}
  };

  const columns: Column<VendorPurchaseOrder>[] = [
    { key: "id", header: "PO Number" },
    {
      key: "Type",
      header: "Type",
      render: (row) => row.purchase_type,
    },
    {
      key: "vendor",
      header: "Vendor",
      render: (row) => row.vendor_name,
    },
    { key: "purchase_date", header: "Order Date" },
    {
      key: "items_total",
      header: "Items Total",
      render: (row) => `₹ ${row.items_total}`,
      className: "text-right",
    },
    {
      key: "delivery_cost",
      header: "Delivery Cost",
      render: (row) => `₹ ${row.delivery_cost}`,
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = STATUS_MAP[row.status as POStatus];
        return s ? (
          <StatusBadge variant={s.variant}>{s.label}</StatusBadge>
        ) : (
          <StatusBadge variant="muted">Unknown</StatusBadge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button
          className="cursor-pointer"
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            confirmDelete(row.id); // ✅ FIXED HERE
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => navigate(`/purchase-orders/${row.id}`)}
      />

      <ConfirmationDialog
        open={openDelete}
        onOpenChange={(o) => {
          if (!o) {
            setOpenDelete(false);
            setSelectedId(null);
          }
        }}
        title="Delete Purchase Order"
        description="Are you sure you want to delete this purchase order? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
