import { useState, useEffect } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { DollarSign, Clock, TrendingUp, ScanSearch } from "lucide-react";
import { Input } from "@/components/ui/input";

// Ensure this path correctly points to your API file based on your folder structure
import { fetchSalaryHistory } from "../../employees/api/EmployeeApi";

const fmt = (n: number) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// We updated the columns to exactly match the backend payload we built in Phase 4
const columns: Column<any>[] = [
  {
    key: "employee_name",
    header: "Employee",
    render: (r) => (
      <div>
        <p className="font-medium">{r.employee_name}</p>
        <p className="text-xs text-muted-foreground">{r.role}</p>
      </div>
    ),
  },
  { 
    key: "month", 
    header: "Period", 
    render: (r) => <span>{r.month}</span> 
  },
  { 
    key: "status", 
    header: "Status", 
    render: (r) => <span className="text-success font-medium bg-success/10 px-2 py-1 rounded-full text-xs">{r.status}</span> 
  },
  { 
    key: "net_pay", 
    header: "Net Pay", 
    render: (r) => <span className="tabular-nums font-bold text-lg">{fmt(r.net_pay)}</span> 
  },
];

export default function PayrollPage() {
  // Default to current month (YYYY-MM)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await fetchSalaryHistory(month);
        setHistory(data || []);
      } catch (error) {
        console.error("Failed to fetch payroll history", error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [month]);

  // Dynamically calculate the top stats based on the fetched data
  const totalPayroll = history.reduce((sum, record) => sum + Number(record.net_pay || 0), 0);
  const avgSalary = history.length > 0 ? totalPayroll / history.length : 0;
  const totalRecords = history.length;

  return (
    <PageLayout>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Payroll</h3>
          </div>
        </div>
      )}

      <PageHeader 
        title="Payroll History" 
        description={`${month} payroll summary`}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter Month:</span>
            <Input 
              type="month" 
              className="w-40" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatsCard title="Total Payroll" value={fmt(totalPayroll)} icon={DollarSign} />
        <StatsCard title="Avg. Net Pay" value={fmt(avgSalary)} icon={TrendingUp} />
        <StatsCard title="Slips Processed" value={totalRecords.toString()} icon={Clock} />
      </div>

      <div className="rounded-md border bg-card">
        <DataTable 
          columns={columns} 
          data={history} 
          keyExtractor={(r) => r.id.toString()} 
        />
      </div>
    </PageLayout>
  );
}