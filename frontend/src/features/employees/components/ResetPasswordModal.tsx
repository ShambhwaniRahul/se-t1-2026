import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Employee } from "@/config/types/role";
import { changePassword } from "../api/EmployeeApi";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function ResetPasswordModal({ employee, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (!oldPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the API endpoint
      await changePassword(employee.id, {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.success(`Password reset successfully for ${employee.full_name}`);
      onClose();
      
      // Clear the form fields after successful reset
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      // Show backend error message if available, otherwise a generic error
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please ensure the old password is correct.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>Change password for {employee?.full_name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Old Password</Label>
            <Input 
              type="password" 
              value={oldPassword} 
              onChange={(e) => setOldPassword(e.target.value)} 
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}