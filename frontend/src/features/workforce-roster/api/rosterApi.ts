import api from "@/lib/api";
import type { RosterEntry } from "../data/types";

// 1. Unified Daily Roster
export const fetchDailyRoster = async (dateString: string): Promise<RosterEntry[]> => {
  const response = await api.get(`/hr/auth/daily-roster/?date=${dateString}`);
  return response.data.data;
};

// 2. Shifts
export const createShift = async (employeeId: number, date: string, startTime: string, endTime: string) => {
  const response = await api.post("/hr/auth/shifts/", {
    employee: employeeId,
    date: date,
    start_time: startTime,
    end_time: endTime,
  });
  return response.data;
};

export const updateShift = async (shiftId: number, date: string, startTime: string, endTime: string) => {
  const response = await api.patch(`/hr/auth/shifts/${shiftId}/`, {
    date: date,
    start_time: startTime,
    end_time: endTime,
  });
  return response.data;
};

export const deleteShift = async (shiftId: number) => {
  await api.delete(`/hr/auth/shifts/${shiftId}/`);
};

// 3. Attendance Logs
export const logCheckIn = async (shiftId: number, entryTime: string) => {
  const response = await api.post("/hr/auth/attendance-logs/", {
    shift: shiftId,
    entry_time: entryTime,
  });
  return response.data;
};

export const logCheckOut = async (attendanceId: number, exitTime: string) => {
  const response = await api.patch(`/hr/auth/attendance-logs/${attendanceId}/`, {
    exit_time: exitTime,
  });
  return response.data;
};