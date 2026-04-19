import type { RosterEntry } from "./types";

/** Roster keyed by ISO date (YYYY-MM-DD). */
export const MOCK_ROSTER_BY_DATE: Record<string, RosterEntry[]> = {
  TODAY: [
    { id: "r1", employeeId: "e1", employeeName: "Marco Rossi", avatarInitials: "MR", role: "Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "06:55", checkOut: "15:10", status: "present" },
    { id: "r2", employeeId: "e2", employeeName: "Aisha Patel", avatarInitials: "AP", role: "Sous Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "07:18", checkOut: "15:45", status: "late" },
    { id: "r3", employeeId: "e3", employeeName: "Elena Vasquez", avatarInitials: "EV", role: "Manager", shiftStart: "09:00", shiftEnd: "18:00", checkIn: "08:58", checkOut: null, status: "on_shift" },
    { id: "r4", employeeId: "e4", employeeName: "James Okonkwo", avatarInitials: "JO", role: "Waiter", shiftStart: "16:00", shiftEnd: "23:00", checkIn: null, checkOut: null, status: "absent" },
    { id: "r5", employeeId: "e5", employeeName: "Sophie Chen", avatarInitials: "SC", role: "Bartender", shiftStart: "16:00", shiftEnd: "23:00", checkIn: "16:02", checkOut: null, status: "on_shift" },
    { id: "r6", employeeId: "e7", employeeName: "Lina Bergström", avatarInitials: "LB", role: "Host", shiftStart: "17:00", shiftEnd: "23:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "r7", employeeId: "e8", employeeName: "Daniel Kim", avatarInitials: "DK", role: "Dishwasher", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "07:00", checkOut: "15:00", status: "present" },
    { id: "r8", employeeId: "e9", employeeName: "Nadia Faris", avatarInitials: "NF", role: "Waiter", shiftStart: "11:00", shiftEnd: "19:00", checkIn: "11:35", checkOut: null, status: "late" },
    { id: "r9", employeeId: "e10", employeeName: "Oliver Tran", avatarInitials: "OT", role: "Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "06:50", checkOut: null, status: "on_shift" },
  ],
  YESTERDAY: [
    { id: "ry1", employeeId: "e1", employeeName: "Marco Rossi", avatarInitials: "MR", role: "Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "06:58", checkOut: "15:05", status: "present" },
    { id: "ry2", employeeId: "e2", employeeName: "Aisha Patel", avatarInitials: "AP", role: "Sous Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "07:01", checkOut: "15:20", status: "present" },
    { id: "ry3", employeeId: "e3", employeeName: "Elena Vasquez", avatarInitials: "EV", role: "Manager", shiftStart: "09:00", shiftEnd: "18:00", checkIn: "09:12", checkOut: "18:30", status: "late" },
    { id: "ry4", employeeId: "e4", employeeName: "James Okonkwo", avatarInitials: "JO", role: "Waiter", shiftStart: "16:00", shiftEnd: "23:00", checkIn: "15:55", checkOut: "23:05", status: "present" },
    { id: "ry5", employeeId: "e5", employeeName: "Sophie Chen", avatarInitials: "SC", role: "Bartender", shiftStart: null, shiftEnd: null, checkIn: null, checkOut: null, status: "off" },
    { id: "ry6", employeeId: "e7", employeeName: "Lina Bergström", avatarInitials: "LB", role: "Host", shiftStart: "17:00", shiftEnd: "23:00", checkIn: null, checkOut: null, status: "absent" },
    { id: "ry7", employeeId: "e8", employeeName: "Daniel Kim", avatarInitials: "DK", role: "Dishwasher", shiftStart: "07:00", shiftEnd: "15:00", checkIn: "07:00", checkOut: "15:00", status: "present" },
    { id: "ry8", employeeId: "e9", employeeName: "Nadia Faris", avatarInitials: "NF", role: "Waiter", shiftStart: "11:00", shiftEnd: "19:00", checkIn: "11:00", checkOut: "19:10", status: "present" },
    { id: "ry9", employeeId: "e10", employeeName: "Oliver Tran", avatarInitials: "OT", role: "Chef", shiftStart: null, shiftEnd: null, checkIn: null, checkOut: null, status: "off" },
  ],
  TOMORROW: [
    { id: "rt1", employeeId: "e1", employeeName: "Marco Rossi", avatarInitials: "MR", role: "Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt2", employeeId: "e2", employeeName: "Aisha Patel", avatarInitials: "AP", role: "Sous Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt3", employeeId: "e3", employeeName: "Elena Vasquez", avatarInitials: "EV", role: "Manager", shiftStart: "09:00", shiftEnd: "18:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt4", employeeId: "e4", employeeName: "James Okonkwo", avatarInitials: "JO", role: "Waiter", shiftStart: "16:00", shiftEnd: "23:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt5", employeeId: "e5", employeeName: "Sophie Chen", avatarInitials: "SC", role: "Bartender", shiftStart: "16:00", shiftEnd: "23:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt6", employeeId: "e7", employeeName: "Lina Bergström", avatarInitials: "LB", role: "Host", shiftStart: null, shiftEnd: null, checkIn: null, checkOut: null, status: "off" },
    { id: "rt7", employeeId: "e8", employeeName: "Daniel Kim", avatarInitials: "DK", role: "Dishwasher", shiftStart: "07:00", shiftEnd: "15:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt8", employeeId: "e9", employeeName: "Nadia Faris", avatarInitials: "NF", role: "Waiter", shiftStart: "11:00", shiftEnd: "19:00", checkIn: null, checkOut: null, status: "scheduled" },
    { id: "rt9", employeeId: "e10", employeeName: "Oliver Tran", avatarInitials: "OT", role: "Chef", shiftStart: "07:00", shiftEnd: "15:00", checkIn: null, checkOut: null, status: "scheduled" },
  ],
};

export function getRosterForDate(date: Date): RosterEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return MOCK_ROSTER_BY_DATE.TODAY;
  if (diff === -1) return MOCK_ROSTER_BY_DATE.YESTERDAY;
  if (diff >= 1) return MOCK_ROSTER_BY_DATE.TOMORROW;
  // Older past dates: return yesterday's snapshot as a stand-in
  return MOCK_ROSTER_BY_DATE.YESTERDAY;
}
