import { useState, useEffect } from "react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { DollarSign, Clock, TrendingUp, Loader2 } from "lucide-react";
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
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={history} 
            keyExtractor={(r) => r.id.toString()} 
          />
        )}
      </div>
    </PageLayout>
  );
}