import { useState } from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerDrawer } from "./CustomerDrawer";
import { useCrm } from "./useCrm";
import type { Customer } from "./crmData";

const loyaltyTier = (points: number) => {
  if (points >= 2000) return { label: "Gold", variant: "warning" as const };
  if (points >= 500) return { label: "Silver", variant: "info" as const };
  if (points > 0) return { label: "Bronze", variant: "muted" as const };
  return { label: "—", variant: "default" as const };
};

const columns: Column<Customer>[] = [
  {
    key: "name",
    header: "Customer",
    render: (c) => (
      <div>
        <p className="font-medium">{c.name}</p>
        <p className="text-xs text-muted-foreground">{c.phone}</p>
      </div>
    ),
  },
  {
    key: "tags",
    header: "Tags",
    render: (c) => (
      <div className="flex flex-wrap gap-1">
        {c.tags.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>
    ),
    className: "hidden md:table-cell",
  },
  {
    key: "loyaltyPoints",
    header: "Loyalty",
    render: (c) => {
      const tier = loyaltyTier(c.loyaltyPoints);
      return (
        <div className="flex items-center gap-2">
          <StatusBadge variant={tier.variant}>{tier.label}</StatusBadge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {c.loyaltyPoints.toLocaleString()} pts
          </span>
        </div>
      );
    },
    className: "hidden sm:table-cell",
  },
  {
    key: "visitCount",
    header: "Visits",
    render: (c) => <span className="tabular-nums">{c.visitCount}</span>,
    className: "hidden lg:table-cell text-center",
  },
  {
    key: "totalSpent",
    header: "Total Spent",
    render: (c) => (
      <span className="tabular-nums font-medium">
        ${c.totalSpent.toLocaleString()}
      </span>
    ),
    className: "hidden sm:table-cell text-right",
  },
  {
    key: "lastVisit",
    header: "Last Visit",
    render: (c) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(c.lastVisit), "MMM d")}
      </span>
    ),
    className: "text-right",
  },
];

export default function CrmPage() {
  const {
    customers,
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    allTags,
    addNote,
    deleteNote,
  } = useCrm();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Customers"
        description="Manage customer relationships, loyalty, and order history."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, phone, or email…"
          className="sm:max-w-xs"
        />
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        onRowClick={handleRowClick}
        emptyState={
          <EmptyState
            icon={Users}
            title="No customers found"
            description={search ? "Try a different search term." : "Customers will appear here once added."}
          />
        }
      />

      <CustomerDrawer
        customer={selectedCustomer}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAddNote={addNote}
        onDeleteNote={deleteNote}
      />
    </PageLayout>
  );
}
