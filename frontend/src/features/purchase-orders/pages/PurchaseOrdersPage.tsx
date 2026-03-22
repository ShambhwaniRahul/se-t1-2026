import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatsCard } from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PurchaseOrdersTable } from "../components/PurchaseOrdersTable";
import { MOCK_PURCHASE_ORDERS, VENDORS } from "../data/mockPurchaseOrders";
import type { POStatus } from "../data/types";

const STATUS_OPTIONS: { value: POStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "ordered", label: "Ordered" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_PURCHASE_ORDERS.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        po.vendor.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || po.status === statusFilter;
      const matchVendor = vendorFilter === "all" || po.vendor.id === vendorFilter;
      return matchSearch && matchStatus && matchVendor;
    });
  }, [search, statusFilter, vendorFilter]);

  const counts = useMemo(() => ({
    total: MOCK_PURCHASE_ORDERS.length,
    draft: MOCK_PURCHASE_ORDERS.filter((p) => p.status === "draft").length,
    ordered: MOCK_PURCHASE_ORDERS.filter((p) => p.status === "ordered").length,
    delivered: MOCK_PURCHASE_ORDERS.filter((p) => p.status === "delivered").length,
  }), []);

  return (
    <PageLayout>
      <PageHeader
        title="Purchase Orders"
        description="Manage vendor procurement and supply orders"
        actions={
          <Button onClick={() => navigate("/purchase-orders/new")}>
            <Plus className="h-4 w-4 mr-1" /> New Order
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Orders" value={counts.total} />
        <StatsCard title="Drafts" value={counts.draft} />
        <StatsCard title="Ordered" value={counts.ordered} />
        <StatsCard title="Delivered" value={counts.delivered} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search PO# or vendor..." className="sm:w-64" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as POStatus | "all")}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {VENDORS.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PurchaseOrdersTable data={filtered} />
    </PageLayout>
  );
}
