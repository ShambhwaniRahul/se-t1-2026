import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, AlertCircle } from "lucide-react";
import type { Employee } from "@/config/types/role";
import { computeSalaryPreview, processSalaryPayment, fetchSalaryHistory } from "../api/EmployeeApi";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function PaySalaryModal({ employee, onClose }: Props) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(15);
  const [bonuses, setBonuses] = useState(0);
  const [deductions, setDeductions] = useState(0);

  const [isComputing, setIsComputing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);

  // Auto-fetch real computation from backend when modal opens or month changes
  useEffect(() => {
    if (employee && month) {
      const fetchRealMath = async () => {
        setIsComputing(true);
        setIsAlreadyPaid(false);

        try {
          // Check if already paid safely (do not throw if 404 or empty)
          const history = await fetchSalaryHistory(month).catch(() => []);
          const alreadyPaid = Array.isArray(history)
            ? history.some((slip: any) => slip.employee_name === employee.full_name || slip.employee === employee.id)
            : false;
          setIsAlreadyPaid(alreadyPaid);
        } catch (err) {
          console.error("Failed to fetch salary history", err);
        }

        try {
          const data = await computeSalaryPreview(employee.id, month);
          setOvertimeHours(data.overtime_hours);
          setDeductions(data.deductions);
          setBonuses(0); // Reset bonuses for new month

          // Calculate their exact hourly rate based on base salary for accuracy
          const hourly = (employee.monthly_salary / 30 / 8) * 1.5;
          setOvertimeRate(Number(hourly.toFixed(2)));
        } catch (error) {
          toast.error("Could not fetch automated payroll data. Using defaults.");
        } finally {
          setIsComputing(false);
        }
      };

      fetchRealMath();
    }
  }, [employee, month]);

  if (!employee) return null;

  const fullName = employee.full_name;
  const baseSalary = employee.monthly_salary;
  const overtimeTotal = overtimeHours * overtimeRate;
  const netPayable = baseSalary + overtimeTotal + bonuses - deductions;

  // THIS IS THE UPDATED SUBMIT FUNCTION
  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      await processSalaryPayment({
        employee_id: employee.id,
        month: month,
        base_salary: baseSalary,
        overtime_hours: overtimeHours,
        bonuses: bonuses,
        deductions: deductions,
        net_pay: netPayable
      });
      toast.success(`Successfully recorded salary payment for ${fullName}`);
      onClose();
    } catch (error: any) {
      // FIX: Now it will show the ACTUAL error sent by the backend!
      const errorMessage = error.response?.data?.message || "Failed to log payment.";
      toast.error(errorMessage);
      console.error("Payment Error Payload:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };
  const downloadPayslip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow pop-ups to download the payslip.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Payslip - ${fullName}</title>
          <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111827; max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
              .header h2 { margin: 0 0 10px 0; font-size: 24px; color: #000; }
              .header p { margin: 5px 0; color: #4b5563; }
              .row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #f3f4f6; }
              .total { font-weight: bold; font-size: 1.25rem; border-top: 2px solid #111827; padding-top: 16px; margin-top: 24px; border-bottom: none;}
              .text-success { color: #16a34a; }
              .text-destructive { color: #dc2626; }
          </style>
      </head>
      <body>
          <div class="header">
              <h2>PAYSLIP</h2>
              <p><strong>Employee:</strong> ${fullName}</p>
              <p><strong>Month:</strong> ${month}</p>
              <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="row"><span>Base Salary</span><span>₹${baseSalary.toFixed(2)}</span></div>
          <div class="row text-success"><span>Overtime (${overtimeHours}h &times; ₹${overtimeRate})</span><span>+₹${overtimeTotal.toFixed(2)}</span></div>
          <div class="row text-success"><span>Bonuses</span><span>+₹${bonuses.toFixed(2)}</span></div>
          <div class="row text-destructive"><span>Deductions</span><span>-₹${deductions.toFixed(2)}</span></div>
          <div class="row total"><span>Net Payable</span><span>₹${netPayable.toFixed(2)}</span></div>
          
          <script>
              window.onload = () => { 
                window.print(); 
                setTimeout(() => window.close(), 500); 
              }
          </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Dialog open={!!employee} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Salary</DialogTitle>
          <DialogDescription>Salary breakdown for {fullName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* MONTH SELECTOR */}
          <div className="flex justify-between items-center bg-muted p-2 rounded-md border">
            <Label>Payroll Month</Label>
            <Input
              type="month"
              className="w-40 h-8"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={isSubmitting || isComputing}
            />
          </div>

          {isAlreadyPaid && !isComputing && (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Salary has already been paid for this month.
              </AlertDescription>
            </Alert>
          )}

          {isComputing ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Monthly Salary</Label>
                <span className="font-medium">₹{baseSalary.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <Label className="whitespace-nowrap text-success">Overtime Hours</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" className="w-20 h-8" value={overtimeHours} onChange={(e) => setOvertimeHours(Number(e.target.value))} />
                  <span className="text-sm text-muted-foreground">× ₹{overtimeRate}/h</span>
                </div>
                <span className="font-medium text-success text-right w-20">+₹{overtimeTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <Label className="text-success">Bonuses</Label>
                <Input type="number" className="w-24 h-8" value={bonuses} onChange={(e) => setBonuses(Number(e.target.value))} />
                <span className="font-medium text-success text-right w-20">+₹{bonuses.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <Label className="text-destructive">Deductions</Label>
                <Input type="number" className="w-24 h-8" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} />
                <span className="font-medium text-destructive text-right w-20">-₹{deductions.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Label className="text-lg font-bold">Net Payable</Label>
                <span className="text-lg font-bold">₹{netPayable.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isComputing}>Cancel</Button>
          <Button variant="secondary" onClick={downloadPayslip} disabled={isSubmitting || isComputing}>
            <Download className="mr-1.5 h-4 w-4" /> Payslip
          </Button>
          <Button onClick={handlePay} disabled={isSubmitting || isComputing || isAlreadyPaid}>
            {isAlreadyPaid ? "Already Paid" : isSubmitting ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}