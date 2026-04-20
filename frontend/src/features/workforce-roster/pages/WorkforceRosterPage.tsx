import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EditShiftSheet } from "../components/EditShiftSheet";
import { LogAttendanceDialog } from "../components/LogAttendanceDialog";
import type { RosterEntry } from "../data/types";
import { CalendarIcon, ScanSearch } from "lucide-react";
import { fetchDailyRoster } from "../api/rosterApi";
import { toast } from "sonner";

const formatTime = (isoString: string | null) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function WorkforceRosterPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [editingShift, setEditingShift] = useState<RosterEntry | null>(null);
  const [loggingAttendance, setLoggingAttendance] = useState<RosterEntry | null>(null);

  const loadRoster = async () => {
    setIsLoading(true);
    try {
      // Format to YYYY-MM-DD exactly as backend expects
      const dateString = format(date, "yyyy-MM-dd");
      const data = await fetchDailyRoster(dateString);
      setRoster(data || []);
    } catch (error) {
      toast.error("Failed to load daily roster.");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch whenever the date changes
  useEffect(() => {
    loadRoster();
  }, [date]);

  const columns: Column<RosterEntry>[] = [
    {
      key: "first_name",
      header: "Employee",
      render: (r) => (
        <div>
          <p className="font-medium">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-muted-foreground">{r.role_display}</p>
        </div>
      ),
    },
    {
      key: "shift",
      header: "Shift (Scheduled)",
      render: (r) => (
        <div className="text-sm">
          {r.shift ? `${formatTime(r.shift.start_time)} - ${formatTime(r.shift.end_time)}` : <span className="text-muted-foreground italic">Off</span>}
        </div>
      ),
    },
    {
      key: "attendance",
      header: "Actual Check In/Out",
      render: (r) => (
        <div className="text-sm font-medium">
          {r.attendance ? `${formatTime(r.attendance.entry_time)} - ${formatTime(r.attendance.exit_time)}` : "--:--"}
        </div>
      ),
    },
    {
      key: "employee_id",
      header: "Status",
      render: (r) => {
        let status = "off";
        let variant: any = "secondary";
        
        if (r.shift) status = "scheduled";
        if (r.attendance?.entry_time) {
           status = r.attendance.exit_time ? "completed" : "on shift";
           variant = r.attendance.exit_time ? "default" : "success";
        } else if (r.shift && new Date() > new Date(r.shift.start_time!)) {
           status = "absent";
           variant = "destructive";
        }

        return <StatusBadge variant={variant}>{status.replace("_", " ")}</StatusBadge>;
      },
    },
    {
      key: "role_display", // arbitrary key for actions
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditingShift(r)}>
            Shift
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setLoggingAttendance(r)}
            disabled={!r.shift} // Can't log attendance if no shift is assigned
          >
            Log Time
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Roster</h3>
          </div>
        </div>
      )}

      <PageHeader
        title="Daily Workforce Roster"
        description="Manage shifts and track daily attendance"
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
        }
      />

      <div className="rounded-md border">
        <DataTable columns={columns} data={roster} keyExtractor={(r) => r.employee_id.toString()} />
      </div>

      <EditShiftSheet
        open={!!editingShift}
        onOpenChange={(o) => !o && setEditingShift(null)}
        entry={editingShift}
        currentDate={date}
        onSaved={loadRoster} // Refreshes table after save
      />

      <LogAttendanceDialog
        open={!!loggingAttendance}
        onOpenChange={(o) => !o && setLoggingAttendance(null)}
        entry={loggingAttendance}
        currentDate={date}
        onSaved={loadRoster} // Refreshes table after save
      />
    </PageLayout>
  );
}