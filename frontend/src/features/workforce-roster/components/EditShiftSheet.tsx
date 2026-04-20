import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { RosterEntry } from "../data/types";
import { createShift, updateShift, deleteShift } from "../api/rosterApi";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: RosterEntry | null;
  currentDate: Date;
  onSaved: () => void;
}

// Helper to extract "HH:MM" from an ISO string or time string
const getHHMM = (timeString?: string | null) => {
  if (!timeString) return "";
  // If it's an ISO string (contains T)
  if (timeString.includes('T')) {
    const d = new Date(timeString);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  // If it's already HH:MM:SS from backend
  return timeString.substring(0, 5); 
};

export function EditShiftSheet({ open, onOpenChange, entry, currentDate, onSaved }: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && entry) {
      setStart(getHHMM(entry.shift?.start_time) || "09:00");
      setEnd(getHHMM(entry.shift?.end_time) || "17:00");
    }
  }, [open, entry]);

  const handleSave = async () => {
    if (!entry) return;
    setIsSubmitting(true);
    
    try {
      // FIX: Backend 'Shifts' uses TimeField, so we just append ":00" for seconds
      const startTimeStr = `${start}:00`;
      const endTimeStr = `${end}:00`;

      if (entry.shift?.id) {
        await updateShift(entry.shift.id, startTimeStr, endTimeStr);
        toast.success("Shift updated.");
      } else {
        await createShift(entry.employee_id, startTimeStr, endTimeStr);
        toast.success("Shift assigned.");
      }
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save shift.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!entry?.shift?.id) return;
    setIsSubmitting(true);
    try {
      await deleteShift(entry.shift.id);
      toast.success("Shift cleared.");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to clear shift. Check if attendance exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entry) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Shift</SheetTitle>
          <SheetDescription>
            {entry.first_name} {entry.last_name} • {format(currentDate, "PPP")}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label>Start Time</Label>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="grid gap-2">
            <Label>End Time</Label>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} disabled={isSubmitting} />
          </div>
        </div>

        <SheetFooter className="mt-6 flex sm:justify-between">
          <Button variant="destructive" onClick={handleClear} disabled={!entry.shift || isSubmitting}>
            Clear Shift
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>Save Shift</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}