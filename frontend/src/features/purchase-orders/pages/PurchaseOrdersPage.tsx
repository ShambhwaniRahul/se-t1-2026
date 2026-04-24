import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ScanSearch } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatsCard } from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseOrdersTable } from "../components/PurchaseOrdersTable";
import type { POStatus } from "@/config/types/vendor";
import type { VendorPurchaseOrder, Vendor } from "@/config/types/vendor";
import api from "@/lib/api";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Received", label: "Delivered" }, // 🔥 UI mein Delivered dikha sakte ho
  { value: "Cancelled", label: "Cancelled" },
];

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [purchaseOrders, setPurchaseOrders] = useState<VendorPurchaseOrder[]>(
    [],
  ); // 🔥 typed properly
  const [loading, setLoading] = useState(true); // 🔥 loader
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const result = await api.get("/procurement/purchase-orders"); // ⚠️ endpoint adjust kar lena
      if (result.data.success) {
        setPurchaseOrders(result.data.data); // 🔥 store real data
        toast.success(
          result.data.message || "Purchase orders fetched successfully",
        );
      } else {
        setError(result.data.message || "Failed to fetch purchase orders");
        toast.error(result.data.message || "Failed to fetch purchase orders");
      }
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      setError("Something went wrong while fetching purchase orders");
      toast.error("Something went wrong while fetching purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get("/procurement/vendors"); // endpoint adjust
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
  }, []);

  const filtered = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.id.toString().includes(search) ||
        po.vendor_name?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || po.status === statusFilter; // 🔥 fixed (no lowercase)

      const matchVendor =
        vendorFilter === "all" || po.vendor === Number(vendorFilter);

      return matchSearch && matchStatus && matchVendor;
    });
  }, [purchaseOrders, search, statusFilter, vendorFilter]);

  const counts = useMemo(
    () => ({
      total: purchaseOrders.length,

      pending: purchaseOrders.filter((p) => p.status === "Pending").length, 
      received: purchaseOrders.filter((p) => p.status === "Received").length,
      cancelled: purchaseOrders.filter((p) => p.status === "Cancelled").length,
    }),
    [purchaseOrders],
  );

  return (
    <PageLayout>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Purchase Orders</h3>
          </div>
        </div>
      )}

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
        <StatsCard title="Pending" value={counts.pending} />
        <StatsCard title="Received" value={counts.received} />
        <StatsCard title="Cancelled" value={counts.cancelled} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search PO# or vendor..."
          className="sm:w-64"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as POStatus | "all")}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.first_name} {v.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PurchaseOrdersTable data={filtered} />
    </PageLayout>
  );
}