import { useNavigate } from "react-router-dom";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge, type StatusBadgeVariant } from "@/components/shared/StatusBadge";
import type { PurchaseOrder, POStatus } from "../data/types";

const STATUS_MAP: Record<POStatus, { label: string; variant: StatusBadgeVariant }> = {
  draft: { label: "Draft", variant: "muted" },
  ordered: { label: "Ordered", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

interface Props {
  data: PurchaseOrder[];
}

export function PurchaseOrdersTable({ data }: Props) {
  const navigate = useNavigate();

  const columns: Column<PurchaseOrder>[] = [
    { key: "poNumber", header: "PO Number" },
    {
      key: "vendor",
      header: "Vendor",
      render: (row) => row.vendor.name,
    },
    { key: "orderDate", header: "Order Date" },
    { key: "expectedDelivery", header: "Expected Delivery" },
    {
      key: "totalAmount",
      header: "Total",
      render: (row) => `$${row.totalAmount.toLocaleString()}`,
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = STATUS_MAP[row.status];
        return <StatusBadge variant={s.variant}>{s.label}</StatusBadge>;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      keyExtractor={(row) => row.id}
      onRowClick={(row) => navigate(`/purchase-orders/${row.id}`)}
    />
  );
}
