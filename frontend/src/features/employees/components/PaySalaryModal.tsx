import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";
import type { Employee } from "@/config/types/role";
import { toast } from "sonner";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

export function PaySalaryModal({ employee, onClose }: Props) {
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(15); 
  const [bonuses, setBonuses] = useState(0);
  const [deductions, setDeductions] = useState(0);

  useEffect(() => {
    if (employee) {
      setOvertimeHours(12);
      setOvertimeRate(15);
      setBonuses(200);
      setDeductions(50);
    }
  }, [employee]);

  if (!employee) return null;

  const fullName = employee.full_name;
  const baseSalary = employee.monthly_salary;
  const overtimeTotal = overtimeHours * overtimeRate;
  const netPayable = baseSalary + overtimeTotal + bonuses - deductions;

  const handlePay = () => {
    toast.success(`Successfully recorded salary payment for ${fullName}`);
    onClose();
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
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="row"><span>Base Salary</span><span>$${baseSalary.toFixed(2)}</span></div>
          <div class="row text-success"><span>Overtime (${overtimeHours}h &times; $${overtimeRate})</span><span>+$${overtimeTotal.toFixed(2)}</span></div>
          <div class="row text-success"><span>Bonuses</span><span>+$${bonuses.toFixed(2)}</span></div>
          <div class="row text-destructive"><span>Deductions</span><span>-$${deductions.toFixed(2)}</span></div>
          <div class="row total"><span>Net Payable</span><span>$${netPayable.toFixed(2)}</span></div>
          
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
    <Dialog open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Salary</DialogTitle>
          <DialogDescription>Salary breakdown for {fullName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center">
            <Label className="text-muted-foreground">Monthly Salary</Label>
            <span className="font-medium">${baseSalary.toFixed(2)}</span>
          </div>
          {/* ... Rest of existing Modal code remains exactly identical ... */}
          
          <div className="flex justify-between items-center gap-4">
            <Label className="whitespace-nowrap text-success">Overtime Hours</Label>
            <div className="flex items-center gap-2">
              <Input type="number" className="w-20 h-8" value={overtimeHours} onChange={(e) => setOvertimeHours(Number(e.target.value))} />
              <span className="text-sm text-muted-foreground">× ${overtimeRate}/h</span>
            </div>
            <span className="font-medium text-success text-right w-20">+${overtimeTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <Label className="text-success">Bonuses</Label>
            <Input type="number" className="w-24 h-8" value={bonuses} onChange={(e) => setBonuses(Number(e.target.value))} />
            <span className="font-medium text-success text-right w-20">+${bonuses.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <Label className="text-destructive">Deductions</Label>
            <Input type="number" className="w-24 h-8" value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} />
            <span className="font-medium text-destructive text-right w-20">-${deductions.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <Label className="text-lg font-bold">Net Payable</Label>
            <span className="text-lg font-bold">${netPayable.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={downloadPayslip}>
            <Download className="mr-1.5 h-4 w-4" /> Payslip
          </Button>
          <Button onClick={handlePay}>Confirm Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}