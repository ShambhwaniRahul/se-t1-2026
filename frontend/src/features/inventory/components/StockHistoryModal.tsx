import { Modal } from "@/components/shared/Modal";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StockMovement } from "../data/inventoryData";
import { format } from "date-fns";

interface StockHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movements: StockMovement[];
  ingredientName?: string;
}

const movementColumns: Column<StockMovement>[] = [
  {
    key: "date",
    header: "Date",
    render: (m) => format(new Date(m.date), "MMM d, yyyy"),
  },
  {
    key: "type",
    header: "Type",
    render: (m) => {
      const variant = m.type === "in" ? "success" : m.type === "out" ? "warning" : "info";
      const label = m.type === "in" ? "Stock In" : m.type === "out" ? "Stock Out" : "Adjustment";
      return <StatusBadge variant={variant}>{label}</StatusBadge>;
    },
  },
  {
    key: "quantity",
    header: "Qty",
    render: (m) => (
      <span className="font-semibold tabular-nums">
        {m.type === "in" ? "+" : m.type === "out" ? "−" : ""}
        {Math.abs(m.quantity)}
      </span>
    ),
  },
  {
    key: "note",
    header: "Note",
  },
];

export function StockHistoryModal({ open, onOpenChange, movements, ingredientName }: StockHistoryModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Stock Movement History"
      description={ingredientName ? `History for ${ingredientName}` : "All stock movements"}
      className="sm:max-w-2xl"
    >
      <DataTable<StockMovement>
        columns={movementColumns}
        data={movements}
        keyExtractor={(m) => m.id}
        emptyState={
          <p className="py-8 text-center text-sm text-muted-foreground">No movements recorded.</p>
        }
      />
    </Modal>
  );
}
