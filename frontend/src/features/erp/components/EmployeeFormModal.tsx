import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee, EmployeeRole, Department } from "../data/erpData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

const ROLES: EmployeeRole[] = ["Chef", "Sous Chef", "Waiter", "Host", "Manager", "Cashier", "Bartender", "Dishwasher"];
const DEPARTMENTS: Department[] = ["Kitchen", "Front of House", "Bar", "Management"];

export function EmployeeFormModal({ open, onOpenChange, employee }: Props) {
  const isEdit = !!employee;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Employee" : "Add Employee"}
      description={isEdit ? "Update employee information." : "Add a new team member."}
      footer={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>{isEdit ? "Save Changes" : "Add Employee"}</Button>
        </div>
      }
    >
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>Full Name</Label>
          <Input defaultValue={employee?.name ?? ""} placeholder="e.g. Marco Rossi" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select defaultValue={employee?.role}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Department</Label>
            <Select defaultValue={employee?.department}>
              <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input defaultValue={employee?.phone ?? ""} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input defaultValue={employee?.email ?? ""} placeholder="email@example.com" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Monthly Salary (₹)</Label>
          <Input type="number" defaultValue={employee?.salary ?? ""} placeholder="0" />
        </div>
      </div>
    </Modal>
  );
}
