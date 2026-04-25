import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isSameDay } from "date-fns";
import type { Employee } from "@/config/types/role";
import { fetchEmployeeShifts, fetchEmployeeAttendance } from "../api/EmployeeApi";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function EmployeeAttendanceModal({ employee, onClose }: Props) {
  const [monthStr, setMonthStr] = useState(format(new Date(), "yyyy-MM")); // YYYY-MM
  const [isLoading, setIsLoading] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    if (employee && monthStr) {
      loadData();
    }
  }, [employee, monthStr]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedShifts = await fetchEmployeeShifts(employee!.id);
      const fetchedLogs = await fetchEmployeeAttendance(employee!.id);
      setShifts(fetchedShifts || []);
      setAttendanceLogs(fetchedLogs || []);
    } catch (err) {
      console.error("Failed to load attendance data", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) return null;

  // Calendar logic
  const monthDate = parseISO(`${monthStr}-01T00:00:00Z`);
  const startDate = startOfMonth(monthDate);
  const endDate = endOfMonth(monthDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Calculate padding days for the first row (assuming week starts on Sunday = 0)
  const startDayOfWeek = getDay(startDate);
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // --- LOGIC FIXES ---
  const combineDateAndTime = (baseDate: Date, timeStr: string) => {
    if (!timeStr) return new Date(baseDate);
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const newDate = new Date(baseDate);
    newDate.setHours(hours, minutes, seconds || 0, 0);
    return newDate;
  };

  const getDayData = (date: Date) => {
    const shift = shifts.find(s => isSameDay(parseISO(s.created_at), date));
    let attendance = null;
    if (shift) {
      attendance = attendanceLogs.find(a => a.shift === shift.id);
    }
    return { shift, attendance };
  };

  const calculateDayStatus = (shift: any, attendance: any, date: Date) => {
    if (!shift) return { status: 'none', message: 'No Shift Scheduled' };
    
    if (date > new Date() && !isSameDay(date, new Date())) {
      return { status: 'scheduled', message: 'Scheduled', color: 'bg-muted-foreground' };
    }

    if (!attendance || !attendance.entry_time) {
      return { status: 'absent', message: 'Absent (No Check-In)', color: 'bg-destructive' };
    }

    if (!attendance.exit_time) {
      return { status: 'working', message: 'Currently Working', color: 'bg-primary' };
    }

    const entryDate = parseISO(attendance.entry_time);
    const shiftStart = combineDateAndTime(date, shift.start_time);
    
    let isLate = entryDate.getTime() > shiftStart.getTime() + (5 * 60 * 1000);
    
    return { 
      status: isLate ? 'late' : 'present', 
      message: isLate ? 'Late Arrival' : 'On Time', 
      color: isLate ? 'bg-amber-500' : 'bg-emerald-500' 
    };
  };

  const calculateOvertime = (shift: any, attendance: any, date: Date) => {
    if (!shift || !attendance || !attendance.exit_time) return 0;
    
    const completedMs = parseISO(attendance.exit_time).getTime() - parseISO(attendance.entry_time).getTime();
    
    const shiftStart = combineDateAndTime(date, shift.start_time);
    let shiftEnd = combineDateAndTime(date, shift.end_time);
    
    if (shiftEnd < shiftStart) {
      shiftEnd.setDate(shiftEnd.getDate() + 1); // overnight shift
    }
    
    const scheduledMs = shiftEnd.getTime() - shiftStart.getTime();
    
    const diffHours = (completedMs - scheduledMs) / (1000 * 60 * 60);
    return diffHours;
  };

  let totalAbsent = 0;
  let totalLate = 0;
  let totalOvertime = 0;

  daysInMonth.forEach(day => {
    if (day > new Date() && !isSameDay(day, new Date())) return; 
    const { shift, attendance } = getDayData(day);
    if (!shift) return;
    
    const statusObj = calculateDayStatus(shift, attendance, day);
    if (statusObj.status === 'absent') totalAbsent++;
    if (statusObj.status === 'late') totalLate++;
    
    const ot = calculateOvertime(shift, attendance, day);
    if (ot > 0) totalOvertime += ot;
  });

  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
      {/* Clean, robust modal sizing. Huge width by default, perfectly centered. */}
      <DialogContent className="max-w-[95vw] w-full lg:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monthly Attendance: {employee.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Top Bar: Stats and Month Picker */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-muted/50 p-4 rounded-xl border gap-4">
            <div className="flex gap-6 divide-x divide-border">
              <div className="px-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Absent</p>
                <p className="text-2xl font-black text-destructive">{totalAbsent}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Late</p>
                <p className="text-2xl font-black text-amber-500">{totalLate}</p>
              </div>
              <div className="px-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Overtime</p>
                <p className="text-2xl font-black text-emerald-500">+{totalOvertime.toFixed(1)}h</p>
              </div>
            </div>
            
            <Input 
              type="month" 
              className="w-40 bg-background" 
              value={monthStr} 
              onChange={(e) => setMonthStr(e.target.value)} 
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground/50" />
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
              <div className="grid grid-cols-7 border-b bg-muted/30">
                {WEEKDAYS.map(day => (
                  <div key={day} className="py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 auto-rows-fr">
                {paddingDays.map(i => (
                  <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-border/50 bg-muted/10" />
                ))}
                
                {daysInMonth.map((day, i) => {
                  const { shift, attendance } = getDayData(day);
                  const statusObj = calculateDayStatus(shift, attendance, day);
                  const otHours = calculateOvertime(shift, attendance, day);
                  const isToday = isSameDay(day, new Date());
                  const isLastColumn = (paddingDays.length + i + 1) % 7 === 0;
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`min-h-[90px] border-b border-border/50 p-2.5 relative transition-colors hover:bg-muted/30
                        ${!isLastColumn ? 'border-r' : ''}
                        ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/30 z-10' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground/70'}`}>
                          {format(day, 'd')}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-bold uppercase text-primary tracking-wider">Today</span>
                        )}
                      </div>
                      
                      {shift && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help group bg-background/50 hover:bg-background border rounded-md px-2 py-1.5 transition-colors">
                                  {statusObj.color && (
                                    <div className={`w-2 h-2 rounded-full shadow-sm flex-shrink-0 ${statusObj.color}`} />
                                  )}
                                  <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground truncate">
                                    {shift.start_time.slice(0,5)}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="p-3 shadow-lg max-w-[200px]">
                                <div className="text-xs space-y-2">
                                  <p className="font-bold border-b pb-1">{statusObj.message}</p>
                                  <div className="space-y-1 pt-1">
                                    <p className="text-muted-foreground flex justify-between">
                                      <span>Scheduled:</span> 
                                      <span className="text-foreground font-medium">
                                        {shift.start_time.slice(0,5)} - {shift.end_time.slice(0,5)}
                                      </span>
                                    </p>
                                    {attendance?.entry_time && (
                                      <p className="text-muted-foreground flex justify-between">
                                        <span>Check In:</span> 
                                        <span className="text-foreground font-medium">
                                          {format(parseISO(attendance.entry_time), 'HH:mm')}
                                        </span>
                                      </p>
                                    )}
                                    {attendance?.exit_time && (
                                      <p className="text-muted-foreground flex justify-between">
                                        <span>Check Out:</span> 
                                        <span className="text-foreground font-medium">
                                          {format(parseISO(attendance.exit_time), 'HH:mm')}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {otHours > 0.05 && (
                              <div className="inline-flex items-center rounded-sm bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                +{otHours.toFixed(1)}h OT
                              </div>
                            )}
                            
                            {otHours < -0.05 && statusObj.status !== 'absent' && (
                              <div className="inline-flex items-center rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-500 border border-amber-500/20">
                                {otHours.toFixed(1)}h Short
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
