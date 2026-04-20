import { useState, useEffect } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Ban, CheckCircle, Banknote, KeyRound, Loader2 } from "lucide-react";
import { ROLES, type Employee } from "@/config/types/role";
import { EmployeeFormModal } from "../components/EmployeeFormModal";
import { PaySalaryModal } from "../components/PaySalaryModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { fetchEmployees, createEmployee, updateEmployee } from "../api/EmployeeApi";
import { toast } from "sonner";

// Map Title Cased AppRoles to Backend Role IDs for new creations
const ROLE_TO_ID: Record<string, number> = {
  "Owner": 0,
  "Manager": 1,
  "Inventory Manager": 2,
  "Accounts": 3,
  "Chef": 4,
  "Waiter": 5,
  "Housekeeping": 6,
  "Watchman": 7,
  "Other": 5 // Default fallback
};

export default function EmployeeManagementPage() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [paySalaryEmployee, setPaySalaryEmployee] = useState<Employee | null>(null);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to fetch employees. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.phone_no?.includes(search)
  );

  const handleSave = async (data: Partial<Employee> & { password?: string; confirm_password?: string }) => {
    try {
      const roleStr = data.roles?.[0]?.role_display as string;
      const roleId = data.roles?.[0]?.role && data.roles[0].role !== 0 
        ? data.roles[0].role 
        : (ROLE_TO_ID[roleStr] ?? 5);

      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender ?? 0, 
        email: data.email,
        phone_no: data.phone_no,
        monthly_salary: data.monthly_salary,
        is_working: data.is_working,
        is_staff: true,
        role_ids: [roleId],
        // Attach both passwords if they exist
        ...(data.password && { 
            password: data.password, 
            confirm_password: data.confirm_password 
        }), 
      };

      if (data.id) {
        const updated = await updateEmployee(data.id, payload);
        setEmployees((prev) => prev.map((emp) => (emp.id === updated.id ? updated : emp)));
        toast.success("Employee updated successfully");
      } else {
        const created = await createEmployee(payload);
        setEmployees((prev) => [...prev, created]);
        toast.success("Employee created successfully");
      }
      setEditing(null);
      setModalOpen(false);
    } catch (error) {
      toast.error("An error occurred while saving the employee.");
      console.error(error);
    }
  };

  const toggleStatus = async (emp: Employee) => {
    try {
      const newStatus = !emp.is_working;
      const roleStr = emp.roles?.[0]?.role_display as string;
      const roleId = emp.roles?.[0]?.role ?? ROLE_TO_ID[roleStr] ?? 5;

      const payload = {
        first_name: emp.first_name,
        last_name: emp.last_name,
        gender: emp.gender,
        email: emp.email,
        phone_no: emp.phone_no,
        monthly_salary: emp.monthly_salary,
        is_working: newStatus,
        is_staff: emp.is_staff,
        role_ids: [roleId]
      };

      const updated = await updateEmployee(emp.id, payload);
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast.success(`${emp.full_name} ${newStatus ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Employee Management"
        description="Create and manage employee accounts, roles, and payroll"
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone…" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Monthly Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => {
                const mainRoleStr = emp.roles?.[0]?.role_display || ROLES.WAITER.value;
                const roleLabel = Object.values(ROLES).find(r => r.value === mainRoleStr)?.label || mainRoleStr;

                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell>{roleLabel}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{emp.phone_no}</TableCell>
                    <TableCell className="font-medium">${emp.monthly_salary}</TableCell>
                    <TableCell>
                      <StatusBadge variant={emp.is_working ? "success" : "destructive"}>
                        {emp.is_working ? "Active" : "Disabled"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(emp); setModalOpen(true); }}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setResetPasswordEmployee(emp)}>
                            <KeyRound className="mr-2 h-3.5 w-3.5" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setPaySalaryEmployee(emp)}>
                            <Banknote className="mr-2 h-3.5 w-3.5 text-success" /> Pay Salary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toggleStatus(emp)}>
                            {emp.is_working ? (
                              <><Ban className="mr-2 h-3.5 w-3.5" /> Disable Access</>
                            ) : (
                              <><CheckCircle className="mr-2 h-3.5 w-3.5" /> Enable Access</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employee={editing}
        onSave={handleSave}
      />

      <ResetPasswordModal 
        employee={resetPasswordEmployee}
        onClose={() => setResetPasswordEmployee(null)}
      />

      <PaySalaryModal 
        employee={paySalaryEmployee} 
        onClose={() => setPaySalaryEmployee(null)} 
      />
    </PageLayout>
  );
}