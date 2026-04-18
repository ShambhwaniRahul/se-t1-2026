import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RosterEntry } from "../data/types";

interface LogAttendanceDialogProps {
  open: boolean;
  entry: RosterEntry | null;
  onClose: () => void;
  onSave: (entryId: string, checkIn: string | null, checkOut: string | null) => void;
}

export function LogAttendanceDialog({ open, entry, onClose, onSave }: LogAttendanceDialogProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    if (entry) {
      setCheckIn(entry.checkIn ?? "");
      setCheckOut(entry.checkOut ?? "");
    }
  }, [entry]);

  const handleSubmit = () => {
    if (entry) {
      onSave(entry.id, checkIn || null, checkOut || null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Attendance</DialogTitle>
          <DialogDescription>
            {entry ? `Manually punch in or out ${entry.employeeName}.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="check-in">Check-In Time</Label>
            <Input
              id="check-in"
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-out">Check-Out Time</Label>
            <Input
              id="check-out"
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Attendance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
