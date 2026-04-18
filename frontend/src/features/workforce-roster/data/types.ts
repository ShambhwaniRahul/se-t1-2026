import type { EmployeeRole } from "@/features/erp/data/types";

export type RosterStatus = "on_shift" | "present" | "late" | "absent" | "scheduled" | "off";

export interface RosterEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  avatarInitials: string;
  role: EmployeeRole;
  shiftStart: string | null; // "09:00"
  shiftEnd: string | null;   // "17:00"
  checkIn: string | null;
  checkOut: string | null;
  status: RosterStatus;
}
