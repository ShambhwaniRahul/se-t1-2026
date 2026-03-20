export type EmploymentStatus = "active" | "inactive";
export type EmployeeRole = "Chef" | "Sous Chef" | "Waiter" | "Host" | "Manager" | "Cashier" | "Bartender" | "Dishwasher";
export type Department = "Kitchen" | "Front of House" | "Bar" | "Management";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  department: Department;
  phone: string;
  email: string;
  status: EmploymentStatus;
  joiningDate: string;
  salary: number;
  avatarInitials: string;
}

export type AttendanceStatus = "present" | "late" | "absent" | "leave";

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
}

export type ShiftType = "morning" | "evening" | "night" | "off";

export interface ShiftAssignment {
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  schedule: Record<string, ShiftType>; // day key -> shift
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  bonuses: number;
  deductions: number;
  netPayable: number;
}

const TODAY = new Date().toISOString().split("T")[0];

export const MOCK_ATTENDANCE: AttendanceEntry[] = [
  { id: "a1", employeeId: "e1", employeeName: "Marco Rossi", date: TODAY, checkIn: "06:55", checkOut: "15:10", status: "present" },
  { id: "a2", employeeId: "e2", employeeName: "Aisha Patel", date: TODAY, checkIn: "07:18", checkOut: "15:45", status: "late" },
  { id: "a3", employeeId: "e3", employeeName: "Elena Vasquez", date: TODAY, checkIn: "08:58", checkOut: null, status: "present" },
  { id: "a4", employeeId: "e4", employeeName: "James Okonkwo", date: TODAY, checkIn: null, checkOut: null, status: "absent" },
  { id: "a5", employeeId: "e5", employeeName: "Sophie Chen", date: TODAY, checkIn: "16:02", checkOut: null, status: "present" },
  { id: "a6", employeeId: "e7", employeeName: "Lina Bergström", date: TODAY, checkIn: null, checkOut: null, status: "leave" },
  { id: "a7", employeeId: "e8", employeeName: "Daniel Kim", date: TODAY, checkIn: "07:00", checkOut: "15:00", status: "present" },
  { id: "a8", employeeId: "e9", employeeName: "Nadia Faris", date: TODAY, checkIn: "11:35", checkOut: null, status: "late" },
  { id: "a9", employeeId: "e10", employeeName: "Oliver Tran", date: TODAY, checkIn: "06:50", checkOut: null, status: "present" },
];

export const ATTENDANCE_SUMMARY = {
  present: 5,
  absent: 1,
  late: 2,
  leave: 1,
};


export const MOCK_EMPLOYEES: Employee[] = [
  { id: "e1", name: "Marco Rossi", role: "Chef", department: "Kitchen", phone: "+1 (555) 234-8901", email: "marco@coherence.app", status: "active", joiningDate: "2022-03-15", salary: 5200, avatarInitials: "MR" },
  { id: "e2", name: "Aisha Patel", role: "Sous Chef", department: "Kitchen", phone: "+1 (555) 345-6789", email: "aisha@coherence.app", status: "active", joiningDate: "2022-08-01", salary: 4100, avatarInitials: "AP" },
  { id: "e3", name: "Elena Vasquez", role: "Manager", department: "Management", phone: "+1 (555) 456-1234", email: "elena@coherence.app", status: "active", joiningDate: "2021-11-20", salary: 5800, avatarInitials: "EV" },
  { id: "e4", name: "James Okonkwo", role: "Waiter", department: "Front of House", phone: "+1 (555) 567-4321", email: "james@coherence.app", status: "active", joiningDate: "2023-01-10", salary: 2800, avatarInitials: "JO" },
  { id: "e5", name: "Sophie Chen", role: "Bartender", department: "Bar", phone: "+1 (555) 678-9012", email: "sophie@coherence.app", status: "active", joiningDate: "2023-04-05", salary: 3200, avatarInitials: "SC" },
  { id: "e6", name: "Tomás Rivera", role: "Cashier", department: "Front of House", phone: "+1 (555) 789-0123", email: "tomas@coherence.app", status: "inactive", joiningDate: "2022-06-18", salary: 2600, avatarInitials: "TR" },
  { id: "e7", name: "Lina Bergström", role: "Host", department: "Front of House", phone: "+1 (555) 890-2345", email: "lina@coherence.app", status: "active", joiningDate: "2023-09-12", salary: 2700, avatarInitials: "LB" },
  { id: "e8", name: "Daniel Kim", role: "Dishwasher", department: "Kitchen", phone: "+1 (555) 901-3456", email: "daniel@coherence.app", status: "active", joiningDate: "2024-01-08", salary: 2200, avatarInitials: "DK" },
  { id: "e9", name: "Nadia Faris", role: "Waiter", department: "Front of House", phone: "+1 (555) 012-4567", email: "nadia@coherence.app", status: "active", joiningDate: "2023-06-22", salary: 2800, avatarInitials: "NF" },
  { id: "e10", name: "Oliver Tran", role: "Chef", department: "Kitchen", phone: "+1 (555) 123-5678", email: "oliver@coherence.app", status: "active", joiningDate: "2024-02-14", salary: 4800, avatarInitials: "OT" },
];

export const MOCK_PAYROLL: PayrollEntry[] = [
  { id: "p1", employeeId: "e1", employeeName: "Marco Rossi", role: "Chef", baseSalary: 5200, overtimeHours: 12, overtimeRate: 45, bonuses: 300, deductions: 520, netPayable: 5520 },
  { id: "p2", employeeId: "e2", employeeName: "Aisha Patel", role: "Sous Chef", baseSalary: 4100, overtimeHours: 8, overtimeRate: 35, bonuses: 200, deductions: 410, netPayable: 4170 },
  { id: "p3", employeeId: "e3", employeeName: "Elena Vasquez", role: "Manager", baseSalary: 5800, overtimeHours: 0, overtimeRate: 50, bonuses: 500, deductions: 580, netPayable: 5720 },
  { id: "p4", employeeId: "e4", employeeName: "James Okonkwo", role: "Waiter", baseSalary: 2800, overtimeHours: 6, overtimeRate: 22, bonuses: 150, deductions: 280, netPayable: 2802 },
  { id: "p5", employeeId: "e5", employeeName: "Sophie Chen", role: "Bartender", baseSalary: 3200, overtimeHours: 10, overtimeRate: 28, bonuses: 180, deductions: 320, netPayable: 3340 },
  { id: "p6", employeeId: "e7", employeeName: "Lina Bergström", role: "Host", baseSalary: 2700, overtimeHours: 4, overtimeRate: 20, bonuses: 100, deductions: 270, netPayable: 2610 },
  { id: "p7", employeeId: "e8", employeeName: "Daniel Kim", role: "Dishwasher", baseSalary: 2200, overtimeHours: 15, overtimeRate: 18, bonuses: 0, deductions: 220, netPayable: 2250 },
  { id: "p8", employeeId: "e9", employeeName: "Nadia Faris", role: "Waiter", baseSalary: 2800, overtimeHours: 5, overtimeRate: 22, bonuses: 120, deductions: 280, netPayable: 2750 },
  { id: "p9", employeeId: "e10", employeeName: "Oliver Tran", role: "Chef", baseSalary: 4800, overtimeHours: 7, overtimeRate: 42, bonuses: 250, deductions: 480, netPayable: 4864 },
];

export const PAYROLL_SUMMARY = {
  totalPayroll: 34026,
  averageSalary: 3781,
  overtimeCosts: 2146,
};


export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const MOCK_SHIFTS: ShiftAssignment[] = [
  { employeeId: "e1", employeeName: "Marco Rossi", role: "Chef", schedule: { Mon: "morning", Tue: "morning", Wed: "morning", Thu: "morning", Fri: "morning", Sat: "off", Sun: "off" } },
  { employeeId: "e2", employeeName: "Aisha Patel", role: "Sous Chef", schedule: { Mon: "morning", Tue: "morning", Wed: "off", Thu: "morning", Fri: "morning", Sat: "morning", Sun: "off" } },
  { employeeId: "e3", employeeName: "Elena Vasquez", role: "Manager", schedule: { Mon: "morning", Tue: "morning", Wed: "morning", Thu: "morning", Fri: "morning", Sat: "off", Sun: "off" } },
  { employeeId: "e4", employeeName: "James Okonkwo", role: "Waiter", schedule: { Mon: "evening", Tue: "evening", Wed: "off", Thu: "evening", Fri: "evening", Sat: "evening", Sun: "off" } },
  { employeeId: "e5", employeeName: "Sophie Chen", role: "Bartender", schedule: { Mon: "evening", Tue: "off", Wed: "evening", Thu: "evening", Fri: "night", Sat: "night", Sun: "off" } },
  { employeeId: "e7", employeeName: "Lina Bergström", role: "Host", schedule: { Mon: "evening", Tue: "evening", Wed: "evening", Thu: "off", Fri: "evening", Sat: "evening", Sun: "off" } },
  { employeeId: "e8", employeeName: "Daniel Kim", role: "Dishwasher", schedule: { Mon: "morning", Tue: "morning", Wed: "morning", Thu: "morning", Fri: "off", Sat: "morning", Sun: "morning" } },
  { employeeId: "e9", employeeName: "Nadia Faris", role: "Waiter", schedule: { Mon: "off", Tue: "evening", Wed: "evening", Thu: "evening", Fri: "evening", Sat: "night", Sun: "off" } },
  { employeeId: "e10", employeeName: "Oliver Tran", role: "Chef", schedule: { Mon: "off", Tue: "off", Wed: "morning", Thu: "morning", Fri: "morning", Sat: "morning", Sun: "morning" } },
];

export const SHIFT_COLORS: Record<ShiftType, { bg: string; text: string; label: string }> = {
  morning: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-800 dark:text-amber-300", label: "Morning" },
  evening: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300", label: "Evening" },
  night: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-800 dark:text-violet-300", label: "Night" },
  off: { bg: "bg-muted", text: "text-muted-foreground", label: "Off" },
};


