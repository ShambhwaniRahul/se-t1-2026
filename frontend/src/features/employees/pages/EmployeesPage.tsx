// import { useState } from "react";
// import { PageLayout } from "@/components/shared/PageLayout";
// import { PageHeader } from "@/components/shared/PageHeader";
// import { SearchInput } from "@/components/shared/SearchInput";
// import { StatusBadge } from "@/components/shared/StatusBadge";
// import { Button } from "@/components/ui/button";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Plus, MoreHorizontal, Pencil, KeyRound, Ban, CheckCircle } from "lucide-react";
// import { ROLES, type Employee } from "@/config/types/role";
// import { EmployeeFormModal } from "../components/EmployeeFormModal";
// import { toast } from "sonner";
// import { useEmployees } from "../hooks/useEmployees";

// export default function EmployeesPage() {
//   // const { employees, addEmployee, updateEmployee } = useAuth();
//   const { employees, addEmployee, updateEmployee } = useEmployees();

//   const [search, setSearch] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState<Employee | null>(null);

//   const filtered = employees.filter(
//     (e) =>
//       e.full_name.toLowerCase().includes(search.toLowerCase()) ||
//       e.email.toLowerCase().includes(search.toLowerCase()) ||
//       e.phone_no.includes(search)
//   );

//   const handleSave = (data: Omit<Employee, "id"> & { id?: string }) => {
//     if (data.id) {
//       updateEmployee(data.id, data);
//     } else {
//       addEmployee({ ...data, id: `emp-${Date.now()}` } as Employee);
//     }
//     setEditing(null);
//   };

//   const handleResetPassword = (emp: Employee) => {
//     updateEmployee(emp.id, { password: "reset123" });
//     toast.success(`Password reset for ${emp.name}. New password: reset123`);
//   };

//   const toggleStatus = (emp: Employee) => {
//     const newStatus = emp.status === "active" ? "disabled" : "active";
//     updateEmployee(emp.id, { status: newStatus });
//     toast.success(`${emp.name} ${newStatus === "active" ? "enabled" : "disabled"}`);
//   };

//   return (
//     <PageLayout>
//       <PageHeader
//         title="Employee Management"
//         description="Create and manage employee accounts and roles"
//         actions={
//           <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
//             <Plus className="mr-1 h-4 w-4" /> Add Employee
//           </Button>
//         }
//       />

//       <div className="mb-4 max-w-sm">
//         <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone…" />
//       </div>

//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead>Role</TableHead>
//               <TableHead className="hidden sm:table-cell">Department</TableHead>
//               <TableHead className="hidden md:table-cell">Phone</TableHead>
//               <TableHead className="hidden md:table-cell">Email</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead className="w-10" />
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filtered.map((emp) => (
//               <TableRow key={emp.id}>
//                 <TableCell className="font-medium">{emp.name}</TableCell>
//                 <TableCell>{ROLES[emp.role]}</TableCell>
//                 <TableCell className="hidden sm:table-cell">{emp.department}</TableCell>
//                 <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{emp.phone}</TableCell>
//                 <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{emp.email}</TableCell>
//                 <TableCell>
//                   <StatusBadge variant={emp.status === "active" ? "success" : "destructive"}>
//                     {emp.status === "active" ? "Active" : "Disabled"}
//                   </StatusBadge>
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => { setEditing(emp); setModalOpen(true); }}>
//                         <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => handleResetPassword(emp)}>
//                         <KeyRound className="mr-2 h-3.5 w-3.5" /> Reset Password
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => toggleStatus(emp)}>
//                         {emp.status === "active" ? (
//                           <><Ban className="mr-2 h-3.5 w-3.5" /> Disable</>
//                         ) : (
//                           <><CheckCircle className="mr-2 h-3.5 w-3.5" /> Enable</>
//                         )}
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//             {filtered.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
//                   No employees found
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <EmployeeFormModal
//         open={modalOpen}
//         onOpenChange={setModalOpen}
//         employee={editing}
//         onSave={handleSave}
//       />
//     </PageLayout>
//   );
// }
