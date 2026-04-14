import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Mail, Phone, MapPin, FileText } from "lucide-react";
import type { Vendor, VendorPurchaseOrder, PurchaseOrderStatus } from "../data/types";

const statusVariant: Record<PurchaseOrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Received: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

const poColumns: Column<VendorPurchaseOrder>[] = [
  { key: "poId", header: "PO ID" },
  { key: "date", header: "Date" },
  { key: "type", header: "Type" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge variant="outline" className={statusVariant[row.status]}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: "deliveryCost",
    header: "Delivery Cost",
    render: (row) => `₹${row.deliveryCost.toLocaleString("en-IN")}`,
  },
];

interface VendorDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  purchaseOrders: VendorPurchaseOrder[];
}

export function VendorDetailSheet({ open, onOpenChange, vendor, purchaseOrders }: VendorDetailSheetProps) {
  if (!vendor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{vendor.firstName} {vendor.lastName}</SheetTitle>
          <SheetDescription>Vendor profile and purchase history</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="text-foreground">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="text-foreground">{vendor.contactNo}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="text-foreground">{vendor.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="font-mono text-foreground">{vendor.gstNumber}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-3">Purchase History</h3>
            <DataTable
              columns={poColumns}
              data={purchaseOrders}
              keyExtractor={(row) => row.id}
              emptyState={
                <p className="text-center py-8 text-sm text-muted-foreground">No purchase orders found for this vendor.</p>
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
