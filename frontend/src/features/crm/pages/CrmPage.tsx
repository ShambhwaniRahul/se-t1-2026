import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, ScanSearch, ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { CustomerDrawer } from "../components/CustomerDrawer";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

interface PaginatedCustomers {
  results: Customer[];
  total_pages: number;
  next: string | null;
  previous: string | null;
}

/* ================= API ================= */

const fetchCustomers = async (page: number, search: string): Promise<PaginatedCustomers> => {
  const res = await api.get("/customers/", { params: { page, search } });
  return res.data?.data || { results: [], total_pages: 1, next: null, previous: null };
};

const fetchOrders = async (
  customerId: number
): Promise<CustomerOrderResponse[]> => {
  const res = await api.get(`/customers/${customerId}/orders`);

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch orders");
  }

  // Extracts results if the orders endpoint was also converted to the global paginated utility
  return res.data?.data?.results || res.data?.data || [];
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
    render: (c) => <span>{c.total_points}</span>,
  },
  {
    key: "visits",
    header: "Visits",
    render: (c) => <span>{c.total_visits}</span>,
  },
  {
    key: "spent",
    header: "Total Spent",
    render: (c) => (
      <span className="font-medium">
        ₹ {c.total_spent.toFixed(2)}
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= DEBOUNCE EFFECT ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); 
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================= CUSTOMERS QUERY ================= */

  const {
    data: customersData,
    isLoading: customersLoading,
  } = useQuery<PaginatedCustomers>({
    queryKey: ["customers", page, debouncedSearch],
    queryFn: () => fetchCustomers(page, debouncedSearch),
  });

  const customers = customersData?.results || [];
  const totalPages = customersData?.total_pages || 1;
  const hasNextPage = customersData?.next !== null;
  const hasPrevPage = customersData?.previous !== null;

  /* ================= ORDERS QUERY ================= */

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    isError,
  } = useQuery<CustomerOrderResponse[]>({
    queryKey: ["customer-orders", selectedCustomer?.id],
    queryFn: () => fetchOrders(selectedCustomer!.id),
    enabled: !!selectedCustomer,
  });

  const orders: CustomerOrderResponse[] = ordersData ?? [];

  useEffect(() => {
    if (isError && ordersError instanceof Error) {
      toast.error(ordersError.message);
    }
  }, [isError, ordersError]);

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
        placeholder="Search database..."
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={customers}
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

      <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-t gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
          
          <div className="flex items-center gap-2 border-l pl-3 ml-1">
            <span className="text-sm text-muted-foreground">Jump to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => {
                const requestedPage = parseInt(e.target.value, 10);
                if (!isNaN(requestedPage) && requestedPage >= 1 && requestedPage <= totalPages) {
                  setPage(requestedPage);
                }
              }}
              className="w-16 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

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