import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { Users, ScanSearch } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { CustomerDrawer } from "../components/CustomerDrawer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

/* ================= TYPES ================= */

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone_no: string;
  total_points: number;
  total_spent: number;
  total_visits: number;
  last_visit: string | null;
  created_at: string;
}

interface CustomerOrderResponse {
  order_id: number;
  total_amount: number;
  created_at: string;
  order_items: string[];
}

/* ================= API ================= */

const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await api.get("/customers/");
  return res.data?.data || [];
};

const fetchOrders = async (
  customerId: number
): Promise<CustomerOrderResponse[]> => {
  const res = await api.get(`/customers/${customerId}/orders`);

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch orders");
  }

  return res.data?.data || [];
};

/* ================= TABLE ================= */

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (c) => (
      <div>
        <p className="font-medium">
          {c.first_name} {c.last_name}
        </p>
        <p className="text-xs text-muted-foreground">{c.phone_no}</p>
      </div>
    ),
  },
  {
    key: "points",
    header: "Points",
    render: (c) => <span>{(c.total_points)}</span>,
  },
  {
    key: "visits",
    header: "Visits",
    render: (c) => <span>{(c.total_visits)}</span>,
  },
  {
    key: "spent",
    header: "Total Spent",
    render: (c) => (
      <span className="font-medium">
        ₹ {(c.total_spent).toFixed(2)}
      </span>
    ),
  },
  {
    key: "lastVisit",
    header: "Last Visit",
    render: (c) => (
      <span className="text-sm text-muted-foreground">
        {c.last_visit
          ? format(new Date(c.last_visit), "MMM d")
          : "—"}
      </span>
    ),
  },
];

/* ================= PAGE ================= */

export default function CrmPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= CUSTOMERS ================= */

  const {
    data: customers = [],
    isLoading: customersLoading,
  } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  /* ================= ORDERS ================= */

const {
  data,
  isLoading: ordersLoading,
  error: ordersError,
  isError,
} = useQuery<CustomerOrderResponse[]>({
  queryKey: ["customer-orders", selectedCustomer?.id],
  queryFn: () => fetchOrders(selectedCustomer!.id),
  enabled: !!selectedCustomer,
});

const orders: CustomerOrderResponse[] = data ?? [];

useEffect(() => {
  if (isError && ordersError instanceof Error) {
    toast.error(ordersError.message);
  }
}, [isError, ordersError]);

  /* ================= SEARCH ================= */

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;

    return customers.filter(
      (c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.phone_no.includes(q)
    );
  }, [customers, search]);

  /* ================= ACTIONS ================= */

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  /* ================= UI ================= */

  return (
    <PageLayout>
      {customersLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Customers</h3>
          </div>
        </div>
      )}

      <PageHeader
        title="Customers"
        description="Manage customer relationships"
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search customers..."
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        onRowClick={handleRowClick}
        emptyState={
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Try a different search."
          />
        }
      />

      <CustomerDrawer
        customer={selectedCustomer}
        orders={orders}
        loadingOrders={ordersLoading}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </PageLayout>
  );
}