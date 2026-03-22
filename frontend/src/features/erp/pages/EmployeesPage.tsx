import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { MOCK_EMPLOYEES } from "../data/erpData";
import type { Employee, EmployeeRole } from "../data/erpData";
import { EmployeeProfileDrawer } from "../components/EmployeeProfileDrawer";
import { EmployeeFormModal } from "../components/EmployeeFormModal";

const ROLES: EmployeeRole[] = ["Chef", "Sous Chef", "Waiter", "Host", "Manager", "Cashier", "Bartender", "Dishwasher"];

const columns: Column<Employee>[] = [
  {
    key: "name",
    header: "Name",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {row.avatarInitials}
        </div>
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  { key: "role", header: "Role" },
  { key: "department", header: "Department", className: "hidden md:table-cell" },
  { key: "phone", header: "Phone", className: "hidden lg:table-cell" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <StatusBadge variant={row.status === "active" ? "success" : "muted"}>
        {row.status === "active" ? "Active" : "Inactive"}
      </StatusBadge>
    ),
  },
  {
    key: "joiningDate",
    header: "Joined",
    className: "hidden lg:table-cell",
    render: (row) => new Date(row.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  },
];

export default function EmployeesPage() {
  const [employees] = useState(MOCK_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filtered = employees.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.replace(/\D/g, "").includes(search.replace(/\D/g, ""));
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRowClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDrawerOpen(true);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Employee Directory"
        description={`${employees.filter((e) => e.status === "active").length} active employees`}
        actions={
          <Button size="sm" onClick={() => { setEditingEmployee(null); setFormOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone…" className="sm:w-72" />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} onRowClick={handleRowClick} />

      <EmployeeProfileDrawer employee={selectedEmployee} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <EmployeeFormModal open={formOpen} onOpenChange={setFormOpen} employee={editingEmployee} />
    </PageLayout>
  );
}
