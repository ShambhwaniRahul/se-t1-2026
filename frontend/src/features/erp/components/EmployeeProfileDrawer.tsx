import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Employee } from "../data/erpData";
import { Calendar, Mail, Phone, DollarSign, Clock, Briefcase } from "lucide-react";

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

const MOCK_ATTENDANCE_SUMMARY = { present: 22, absent: 1, late: 2, leave: 1 };
const MOCK_SHIFTS_ASSIGNED = ["Mon Morning", "Tue Morning", "Wed Morning", "Thu Morning", "Fri Morning"];

export function EmployeeProfileDrawer({ employee, open, onOpenChange }: Props) {
  if (!employee) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {employee.avatarInitials}
            </div>
            <div>
              <SheetTitle className="text-left">{employee.name}</SheetTitle>
              <SheetDescription className="text-left">{employee.role} · {employee.department}</SheetDescription>
            </div>
          </div>
          <StatusBadge variant={employee.status === "active" ? "success" : "muted"} className="mt-2 w-fit">
            {employee.status === "active" ? "Active" : "Inactive"}
          </StatusBadge>
        </SheetHeader>

        <Separator />

        <div className="space-y-6 py-6">
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal Details</h4>
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Phone" value={employee.phone} />
            <InfoRow icon={Calendar} label="Joined" value={new Date(employee.joiningDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
          </section>

          <Separator />

          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compensation</h4>
            <InfoRow icon={DollarSign} label="Monthly Salary" value={`$${employee.salary.toLocaleString()}`} />
            <InfoRow icon={Briefcase} label="Department" value={employee.department} />
          </section>

          <Separator />

          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendance (This Month)</h4>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(MOCK_ATTENDANCE_SUMMARY).map(([k, v]) => (
                <div key={k} className="rounded-lg border p-2 text-center">
                  <p className="text-lg font-bold tabular-nums">{v}</p>
                  <p className="text-[10px] capitalize text-muted-foreground">{k}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned Shifts</h4>
            <div className="flex flex-wrap gap-1.5">
              {MOCK_SHIFTS_ASSIGNED.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
