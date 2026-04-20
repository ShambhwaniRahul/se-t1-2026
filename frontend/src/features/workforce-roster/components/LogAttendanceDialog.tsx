import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { RosterEntry } from "../data/types";
import { logCheckIn, logCheckOut } from "../api/rosterApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: RosterEntry | null;
  currentDate: Date;
  onSaved: () => void;
}

export function LogAttendanceDialog({ open, onOpenChange, entry, currentDate, onSaved }: Props) {
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCheckedIn = !!entry?.attendance?.id;
  const actionLabel = hasCheckedIn ? "Check Out" : "Check In";

  useEffect(() => {
    if (open) {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [open]);

  const combineDateAndTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    // Using local timezone to build the datetime so the backend receives the exact moment
    const d = new Date(currentDate);
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return d.toISOString();
  };

  const handleSave = async () => {
    if (!entry?.shift?.id) return;
    setIsSubmitting(true);
    
    try {
      const isoTime = combineDateAndTime(time);

      if (hasCheckedIn && entry.attendance?.id) {
        await logCheckOut(entry.attendance.id, isoTime);
        toast.success("Check-out recorded.");
      } else {
        await logCheckIn(entry.shift.id, isoTime);
        toast.success("Check-in recorded.");
      }
      
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      // Improved error parsing to catch Django validation errors
      let errorMsg = `Failed to ${actionLabel.toLowerCase()}.`;
      if (error.response?.data) {
        if (typeof error.response.data.message === "string") {
            errorMsg = error.response.data.message;
        } else if (Array.isArray(error.response.data.non_field_errors)) {
            errorMsg = error.response.data.non_field_errors[0];
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log {actionLabel}</DialogTitle>
          <DialogDescription>
            Recording {actionLabel.toLowerCase()} for {entry.first_name} {entry.last_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <Label>{actionLabel} Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>Confirm {actionLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}