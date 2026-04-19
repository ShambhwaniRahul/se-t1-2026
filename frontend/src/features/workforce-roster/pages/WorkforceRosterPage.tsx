import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Download, MoreHorizontal } from "lucide-react";

import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { getRosterForDate } from "../data/mockRoster";
import type { RosterEntry, RosterStatus } from "../data/types";
import { formatShiftRange, formatTime12, STATUS_BADGE_CLASS, STATUS_LABEL } from "../utils";
import { EditShiftSheet } from "../components/EditShiftSheet";
import { LogAttendanceDialog } from "../components/LogAttendanceDialog";

export default function WorkforceRosterPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [editEntry, setEditEntry] = useState<RosterEntry | null>(null);
  const [logEntry, setLogEntry] = useState<RosterEntry | null>(null);
  const [assignSheet, setAssignSheet] = useState(false);

  // Refresh data when date changes
  useEffect(() => {
    setRoster(getRosterForDate(date));
  }, [date]);

  const handleEditShift = (entryId: string, shiftStart: string, shiftEnd: string) => {
    setRoster((prev) =>
      prev.map((r) =>
        r.id === entryId
          ? { ...r, shiftStart, shiftEnd, status: r.checkIn ? r.status : "scheduled" as RosterStatus }
          : r,
      ),
    );
    toast.success("Shift updated");
  };

  const handleLogAttendance = (entryId: string, checkIn: string | null, checkOut: string | null) => {
    setRoster((prev) =>
      prev.map((r) => {
        if (r.id !== entryId) return r;
        let status: RosterStatus = r.status;
        if (checkIn && r.shiftStart) {
          status = checkIn > r.shiftStart ? "late" : checkOut ? "present" : "on_shift";
        } else if (!checkIn) {
          status = "scheduled";
        }
        if (checkIn && checkOut) status = "present";
        return { ...r, checkIn, checkOut, status };
      }),
    );
    toast.success("Attendance updated");
  };

  const handleMarkAbsent = (entryId: string) => {
    setRoster((prev) =>
      prev.map((r) =>
        r.id === entryId ? { ...r, status: "absent" as RosterStatus, checkIn: null, checkOut: null } : r,
      ),
    );
    toast.success("Marked as absent");
  };

  const handleExport = () => {
    const headers = ["Employee", "Role", "Shift", "Check-In", "Check-Out", "Status"];
    const rows = roster.map((r) => [
      r.employeeName,
      r.role,
      formatShiftRange(r.shiftStart, r.shiftEnd),
      formatTime12(r.checkIn),
      formatTime12(r.checkOut),
      STATUS_LABEL[r.status],
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roster-${format(date, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Roster exported");
  };

  const columns: Column<RosterEntry>[] = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        render: (r) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {r.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{r.employeeName}</span>
          </div>
        ),
      },
      { key: "role", header: "Role", render: (r) => <span className="text-muted-foreground">{r.role}</span> },
      {
        key: "shift",
        header: "Scheduled Shift",
        render: (r) => (
          <span className={cn("tabular-nums text-sm", !r.shiftStart && "text-muted-foreground italic")}>
            {formatShiftRange(r.shiftStart, r.shiftEnd)}
          </span>
        ),
      },
      {
        key: "checkIn",
        header: "Check-In",
        render: (r) => <span className="tabular-nums text-sm">{formatTime12(r.checkIn)}</span>,
      },
      {
        key: "checkOut",
        header: "Check-Out",
        render: (r) => <span className="tabular-nums text-sm">{formatTime12(r.checkOut)}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <Badge className={cn("font-medium", STATUS_BADGE_CLASS[r.status])} variant="outline">
            {STATUS_LABEL[r.status]}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-[60px]",
        render: (r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditEntry(r)}>Edit Shift</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLogEntry(r)}>Log Attendance</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleMarkAbsent(r.id)}
                className="text-destructive focus:text-destructive"
              >
                Mark Absent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  return (
    <PageLayout>
      <PageHeader
        title="Daily Roster"
        description="Unified view of scheduled shifts and attendance for the day."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-[200px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export Roster
            </Button>
            <Button onClick={() => setAssignSheet(true)}>
              <Plus className="h-4 w-4" />
              Assign Shift
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={roster}
        keyExtractor={(r) => r.id}
        emptyState={
          <div className="rounded-md border p-12 text-center text-muted-foreground">
            No roster entries for this date.
          </div>
        }
      />

      <EditShiftSheet
        open={!!editEntry || assignSheet}
        entry={editEntry}
        onClose={() => {
          setEditEntry(null);
          setAssignSheet(false);
        }}
        onSave={handleEditShift}
      />

      <LogAttendanceDialog
        open={!!logEntry}
        entry={logEntry}
        onClose={() => setLogEntry(null)}
        onSave={handleLogAttendance}
      />
    </PageLayout>
  );
}
