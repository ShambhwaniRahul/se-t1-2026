export interface ShiftData {
  id: number;
  start_time: string | null; // ISO String
  end_time: string | null;   // ISO String
}

export interface AttendanceData {
  id: number;
  entry_time: string | null; // ISO String
  exit_time: string | null;  // ISO String
}

export interface RosterEntry {
  employee_id: number;
  first_name: string;
  last_name: string;
  role_display: string;
  shift: ShiftData | null;
  attendance: AttendanceData | null;
}