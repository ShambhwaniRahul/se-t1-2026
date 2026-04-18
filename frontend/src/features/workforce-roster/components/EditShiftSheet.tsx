import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RosterEntry } from "../data/types";

interface EditShiftSheetProps {
  open: boolean;
  entry: RosterEntry | null;
  onClose: () => void;
  onSave: (entryId: string, shiftStart: string, shiftEnd: string) => void;
}

export function EditShiftSheet({ open, entry, onClose, onSave }: EditShiftSheetProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setStart(entry.shiftStart ?? "09:00");
      setEnd(entry.shiftEnd ?? "17:00");
      setError(null);
    }
  }, [entry]);

  const handleSubmit = () => {
    if (!start || !end) {
      setError("Both start and end times are required.");
      return;
    }
    if (start >= end) {
      setError("End time must be after start time.");
      return;
    }
    if (entry) {
      onSave(entry.id, start, end);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Shift</SheetTitle>
          <SheetDescription>
            {entry ? `Update shift times for ${entry.employeeName}.` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shift-start">Start Time</Label>
            <Input
              id="shift-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift-end">End Time</Label>
            <Input
              id="shift-end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Shift</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
