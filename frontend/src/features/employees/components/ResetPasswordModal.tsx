import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Employee } from "@/config/types/role";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function ResetPasswordModal({ employee, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (!oldPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }
    
    toast.success(`Password reset successfully for ${employee?.full_name}`);
    onClose();
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>Change password for {employee?.full_name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Old Password</Label>
            <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Update Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}