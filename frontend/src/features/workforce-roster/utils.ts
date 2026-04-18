import type { RosterStatus } from "./data/types";

/** Convert "HH:mm" 24h to "hh:mm AM/PM". */
export function formatTime12(t: string | null): string {
  if (!t) return "--";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return "--";
  const period = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatShiftRange(start: string | null, end: string | null): string {
  if (!start || !end) return "Unassigned";
  return `${formatTime12(start)} - ${formatTime12(end)}`;
}

export const STATUS_LABEL: Record<RosterStatus, string> = {
  on_shift: "On Shift",
  present: "Present",
  late: "Late Entry",
  absent: "Absent",
  scheduled: "Scheduled",
  off: "Day Off",
};

export const STATUS_BADGE_CLASS: Record<RosterStatus, string> = {
  on_shift: "bg-success/15 text-success border border-success/30 hover:bg-success/20",
  present: "bg-success/15 text-success border border-success/30 hover:bg-success/20",
  late: "bg-warning/15 text-warning border border-warning/30 hover:bg-warning/20",
  absent: "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/20",
  scheduled: "bg-transparent text-foreground border border-border hover:bg-muted",
  off: "bg-muted text-muted-foreground border border-border hover:bg-muted/80",
};
