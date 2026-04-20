import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES, type Employee, type AppRole } from "@/config/types/role";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  // Add confirm_password to the type
  onSave: (data: Partial<Employee> & { password?: string; confirm_password?: string }) => void; 
}

export function EmployeeFormModal({ open, onOpenChange, employee, onSave }: Props) {
  const isEdit = !!employee;
  
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_no, setPhoneNo] = useState("");
  const [monthly_salary, setMonthlySalary] = useState<number | "">("");
  const [roleStr, setRoleStr] = useState<string>(ROLES.WAITER.value);
  const [is_working, setIsWorking] = useState<boolean>(true);
  
  // Password state (Only used for Creation)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (open) {
      setFirstName(employee?.first_name ?? "");
      setLastName(employee?.last_name ?? "");
      setEmail(employee?.email ?? "");
      setPhoneNo(employee?.phone_no ?? "");
      setMonthlySalary(employee?.monthly_salary ?? "");
      setIsWorking(employee?.is_working ?? true);
      
      // Map existing role directly since Django get_role_display() matches AppRole strings
      const existingRole = employee?.roles?.[0]?.role_display ?? ROLES.WAITER.value;
      setRoleStr(existingRole);
      
      // Reset passwords on open
      setPassword("");
      setConfirmPassword("");
    }
  }, [open, employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!first_name || !last_name) {
      toast.error("First Name and Last Name are required");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    // Strict validation for New Employees
    if (!isEdit) {
      if (!password) {
        toast.error("Password is required for new employees");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
    }

    onSave({
      ...(employee ? { id: employee.id } : {}),
      first_name,
      last_name,
      email,
      phone_no,
      monthly_salary: Number(monthly_salary) || 0,
      is_working,
      roles: [{ role: 0, role_display: roleStr as AppRole }],
      // Send BOTH passwords to the backend
      ...( !isEdit ? { password, confirm_password: confirmPassword } : {} ),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Employee Details" : "Add New Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={first_name} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={last_name} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={phone_no} onChange={(e) => setPhoneNo(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Monthly Salary ($)</Label>
              <Input 
                type="number" 
                value={monthly_salary} 
                onChange={(e) => setMonthlySalary(Number(e.target.value))} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleStr} onValueChange={setRoleStr}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.values(ROLES).map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={is_working ? "true" : "false"} onValueChange={(v) => setIsWorking(v === "true")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PASSWORD FIELDS - ONLY VISIBLE DURING CREATION */}
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t mt-2">
              <div className="space-y-2">
                <Label>Account Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isEdit}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Create Employee"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}