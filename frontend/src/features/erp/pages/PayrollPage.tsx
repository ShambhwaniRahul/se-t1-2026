import { useState } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { DollarSign, Clock, TrendingUp } from "lucide-react";
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
    </PageLayout>
  );
}


