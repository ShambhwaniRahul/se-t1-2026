import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_SHIFTS, WEEK_DAYS, SHIFT_COLORS } from "../data/erpData";
import type { ShiftType } from "../data/erpData";
import { cn } from "@/lib/utils";

export default function ShiftsPage() {
  const [editModal, setEditModal] = useState<{ employeeName: string; day: string; current: ShiftType } | null>(null);

  return (
    <PageLayout>
      <PageHeader title="Shift Scheduler" description="Weekly shift assignments" />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Employee</th>
                {WEEK_DAYS.map((d) => (
                  <th key={d} className="px-2 py-3 text-center text-sm font-medium text-muted-foreground">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_SHIFTS.map((row) => (
                <tr key={row.employeeId} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{row.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{row.role}</p>
                  </td>
                  {WEEK_DAYS.map((day) => {
                    const shift = row.schedule[day] as ShiftType;
                    const style = SHIFT_COLORS[shift];
                    return (
                      <td key={day} className="px-2 py-3 text-center">
                        <button
                          onClick={() => setEditModal({ employeeName: row.employeeName, day, current: shift })}
                          className={cn(
                            "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1",
                            style.bg,
                            style.text,
                          )}
                        >
                          {style.label}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        open={!!editModal}
        onOpenChange={(o) => !o && setEditModal(null)}
        title="Assign Shift"
        description={editModal ? `${editModal.employeeName} — ${editModal.day}` : ""}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={() => setEditModal(null)}>Save</Button>
          </div>
        }
      >
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Shift</Label>
            <Select defaultValue={editModal?.current}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(SHIFT_COLORS) as ShiftType[]).map((s) => (
                  <SelectItem key={s} value={s}>{SHIFT_COLORS[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
