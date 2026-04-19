import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Banknote, KeyRound } from "lucide-react";
import { ROLE_LABELS } from "@/types/roles";
import { MOCK_EMPLOYEES } from "../data/mockEmployees";
import type { Employee } from "@/config/types/role";
import { EmployeeFormModal } from "../components/EmployeeFormModal";
import { PaySalaryModal } from "../components/PaySalaryModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { toast } from "sonner";

export default function EmployeeManagementPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  
  const [paySalaryEmployee, setPaySalaryEmployee] = useState<Employee | null>(null);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);

  const filtered = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone_no.includes(search)
  );

  // Updated Signature to accept the optional password
  const handleSave = (data: Partial<Employee> & { password?: string }) => {
    if (data.id) {
      setEmployees((prev) => 
        prev.map((emp) => (emp.id === data.id ? { ...emp, ...data, full_name: `${data.first_name} ${data.last_name}` } as Employee : emp))
      );
    } else {
      const newEmp: Employee = {
        id: Date.now(),
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        full_name: `${data.first_name} ${data.last_name}`,
        gender: 0,
        gender_display: "Not Specified",
        email: `${data.first_name?.toLowerCase() || "user"}@restaurant.com`,
        phone_no: data.phone_no || "",
        monthly_salary: data.monthly_salary || 0,
        joining_date: new Date().toISOString(),
        leaving_date: null,
        is_working: data.is_working ?? true,
        is_staff: true,
        roles: data.roles || [{ role_display: "pos" as any }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Here is where you would send `data.password` to your backend API 
      // await createEmployeeAPI(newEmp, data.password);

      setEmployees((prev) => [...prev, newEmp]);
    }
    setEditing(null);
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
            {filtered.map((emp) => {
              const mainRoleStr = emp.roles?.[0]?.role_display || "pos";
              const roleLabel = ROLE_LABELS[mainRoleStr as keyof typeof ROLE_LABELS] || mainRoleStr;

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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No employees found
                </TableCell>
              </TableRow>
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