import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Clock, TrendingUp, Download } from "lucide-react";
import { MOCK_PAYROLL, PAYROLL_SUMMARY } from "../data/erpData";
import type { PayrollEntry } from "../data/erpData";

const fmt = (n: number) => `$${n.toLocaleString()}`;

const columns: Column<PayrollEntry>[] = [
  {
    key: "employeeName",
    header: "Employee",
    render: (r) => (
      <div>
        <p className="font-medium">{r.employeeName}</p>
        <p className="text-xs text-muted-foreground">{r.role}</p>
      </div>
    ),
  },
  { key: "baseSalary", header: "Base Salary", render: (r) => <span className="tabular-nums">{fmt(r.baseSalary)}</span> },
  { key: "overtimeHours", header: "OT Hours", className: "hidden md:table-cell", render: (r) => <span className="tabular-nums">{r.overtimeHours}h</span> },
  { key: "bonuses", header: "Bonuses", className: "hidden md:table-cell", render: (r) => <span className="tabular-nums text-success">{fmt(r.bonuses)}</span> },
  { key: "deductions", header: "Deductions", className: "hidden lg:table-cell", render: (r) => <span className="tabular-nums text-destructive">-{fmt(r.deductions)}</span> },
  { key: "netPayable", header: "Net Pay", render: (r) => <span className="tabular-nums font-semibold">{fmt(r.netPayable)}</span> },
];

export default function PayrollPage() {
  const [selected, setSelected] = useState<PayrollEntry | null>(null);

  return (
    <PageLayout>
      <PageHeader title="Payroll" description="March 2026 payroll summary" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard title="Total Payroll" value={fmt(PAYROLL_SUMMARY.totalPayroll)} icon={DollarSign} />
        <StatsCard title="Avg. Salary" value={fmt(PAYROLL_SUMMARY.averageSalary)} icon={TrendingUp} />
        <StatsCard title="Overtime Costs" value={fmt(PAYROLL_SUMMARY.overtimeCosts)} icon={Clock} />
      </div>

      <DataTable columns={columns} data={MOCK_PAYROLL} keyExtractor={(r) => r.id} onRowClick={(r) => setSelected(r)} />

      <Modal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Salary Breakdown"
        description={selected?.employeeName ?? ""}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button variant="secondary">
              <Download className="mr-1.5 h-4 w-4" /> Download Payslip
            </Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4 py-2">
            <Row label="Base Salary" value={fmt(selected.baseSalary)} />
            <Row label={`Overtime (${selected.overtimeHours}h × $${selected.overtimeRate})`} value={`+${fmt(selected.overtimeHours * selected.overtimeRate)}`} className="text-success" />
            <Row label="Bonuses" value={`+${fmt(selected.bonuses)}`} className="text-success" />
            <Row label="Deductions" value={`-${fmt(selected.deductions)}`} className="text-destructive" />
            <Separator />
            <Row label="Net Payable" value={fmt(selected.netPayable)} className="text-lg font-bold" />
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${className ?? "text-sm font-medium"}`}>{value}</span>
    </div>
  );
}
