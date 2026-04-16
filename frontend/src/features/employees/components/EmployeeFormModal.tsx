import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES, type AppRole, type Employee } from "@/config/types/role";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (data: EmployeeFormData) => void;
}

type EmployeeFormData = {
  id?: number;
  full_name: string;
  email: string;
  phone_no: string;
  roles: { role_display: AppRole }[];
  is_working: boolean;
};

export function EmployeeFormModal({ open, onOpenChange, employee, onSave }: Props) {
  const isEdit = !!employee;
  const [full_name, setName] = useState(employee?.full_name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [phone_no, setPhone] = useState(employee?.phone_no ?? "");
  const [role, setRole] = useState<AppRole>(employee?.roles?.[0]?.role_display ?? "other");
  const [is_working, setStatus] = useState<boolean>(employee?.is_working ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!full_name || !email) {
      toast.error("Name and email are required");
      return;
    }
    onSave({
      ...(employee ? { id: employee.id } : {}),
      full_name,
      email,
      phone_no,
      roles: [{ role_display: role }],
      is_working,
    });
    onOpenChange(false);
    toast.success(isEdit ? "Employee updated" : "Employee created");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={full_name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone_no} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(ROLES).map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* <div className="space-y-2">
              <Label>{isEdit ? "New Password (leave blank to keep)" : "Password"}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEdit}
                placeholder={isEdit ? "Unchanged" : ""}
              />
            </div> */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={is_working ? "active" : "disabled"}
                onValueChange={(v) => setStatus(v === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Create Employee"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
