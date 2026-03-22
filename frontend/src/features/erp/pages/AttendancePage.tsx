import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { StatusBadge, type StatusBadgeVariant } from "@/components/shared/StatusBadge";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/Modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, UserX, Clock, CalendarOff } from "lucide-react";
import { MOCK_ATTENDANCE, ATTENDANCE_SUMMARY } from "../data/erpData";
import type { AttendanceEntry, AttendanceStatus } from "../data/erpData";

const STATUS_MAP: Record<AttendanceStatus, { label: string; variant: StatusBadgeVariant }> = {
  present: { label: "Present", variant: "success" },
  late: { label: "Late", variant: "warning" },
  absent: { label: "Absent", variant: "destructive" },
  leave: { label: "Leave", variant: "info" },
};

const columns: Column<AttendanceEntry>[] = [
  { key: "employeeName", header: "Employee" },
  { key: "checkIn", header: "Check In", render: (r) => <span className="tabular-nums">{r.checkIn ?? "—"}</span> },
  { key: "checkOut", header: "Check Out", render: (r) => <span className="tabular-nums">{r.checkOut ?? "—"}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => {
      const s = STATUS_MAP[r.status];
      return <StatusBadge variant={s.variant}>{s.label}</StatusBadge>;
    },
  },
];

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editEntry, setEditEntry] = useState<AttendanceEntry | null>(null);

  return (
    <PageLayout>
      <PageHeader title="Attendance" description={`Attendance for ${new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Present" value={ATTENDANCE_SUMMARY.present} icon={UserCheck} />
        <StatsCard title="Absent" value={ATTENDANCE_SUMMARY.absent} icon={UserX} />
        <StatsCard title="Late Arrivals" value={ATTENDANCE_SUMMARY.late} icon={Clock} />
        <StatsCard title="On Leave" value={ATTENDANCE_SUMMARY.leave} icon={CalendarOff} />
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
      </div>

      <DataTable columns={columns} data={MOCK_ATTENDANCE} keyExtractor={(r) => r.id} onRowClick={(r) => setEditEntry(r)} />

      <Modal
        open={!!editEntry}
        onOpenChange={(o) => !o && setEditEntry(null)}
        title="Edit Attendance"
        description={editEntry?.employeeName ?? ""}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditEntry(null)}>Cancel</Button>
            <Button onClick={() => setEditEntry(null)}>Save</Button>
          </div>
        }
      >
        {editEntry && (
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Check In</Label>
                <Input type="time" defaultValue={editEntry.checkIn ?? ""} />
              </div>
              <div className="grid gap-2">
                <Label>Check Out</Label>
                <Input type="time" defaultValue={editEntry.checkOut ?? ""} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select defaultValue={editEntry.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_MAP) as AttendanceStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
