import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  XCircle,
  CheckCircle2,
  ScanSearch,
} from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PurchaseOrderItemsTable } from "../components/PurchaseOrderItemsTable";
import type { POStatus } from "@/config/types/vendor";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

const STATUS_VARIANT: Record<POStatus, StatusBadgeVariant> = {
  Pending: "warning",
  Received: "success",
  Cancelled: "destructive",
};

const STATUS_LABEL: Record<POStatus, string> = {
  Pending: "Pending",
  Received: "Delivered",
  Cancelled: "Cancelled",
};

// Sequential messages displayed during the AI OCR processing phase
const PROCESSING_STEPS = [
  "Uploading invoice image...",
  "Running AI OCR extraction...",
  "Mapping items to inventory...",
  "Finalizing receipt...",
];

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [status, setStatus] = useState<POStatus>("Pending");

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // States for handling the extended AI processing UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  // Cycles through processing messages every 2.5 seconds while isProcessing is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setProcessStep(0);
      interval = setInterval(() => {
        setProcessStep((prev) =>
          prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev,
        );
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const markAsReceived = async () => {
    if (!invoiceFile) {
      toast.error("Invoice image is required to mark order as received");
      return;
    }

    // Close dialog immediately to show the processing overlay
    setReceiveOpen(false);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("invoice_image", invoiceFile);
      formData.append("purchase", id as string);

      const res = await api.post(`/procurement/vendor-invoices/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Order marked as received");
      } else {
        toast.error(res.data.message || "Failed to mark as received");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as received");
    } finally {
      fetchPurchaseOrder();
      setIsProcessing(false);
      setInvoiceFile(null);
    }
  };

  const cancelOrder = async () => {
    try {
      const res = await api.post(`/procurement/purchase-orders/${id}/cancel/`);

      if (res.data.success) {
        toast.success(res.data.message || "Order cancelled");
      } else {
        toast.error(res.data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    } finally {
      fetchPurchaseOrder();
      setCancelOpen(false);
    }
  };

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/procurement/purchase-orders/${id}/items`);

      if (res.data.success) {
        setItems(res.data.data.items);
        setStatus(res.data.data.status);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  if (!items || items.length === 0) {
    return (
      <PageLayout>
        <PageHeader
          title="Not Found"
          description="This purchase order does not exist"
        />
        <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </PageLayout>
    );
  }

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

  const handleDownloadReceipt = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("Please allow pop-ups to download receipt.");
      return;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>PO Receipt - ${id}</title>
        <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 40px;
              color: #111827;
              max-width: 700px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .header h2 {
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0;
              color: #4b5563;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 1px dashed #f3f4f6;
            }
            .table {
              margin-top: 20px;
              width: 100%;
              border-collapse: collapse;
            }
            .table th, .table td {
              text-align: left;
              padding: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .total {
              margin-top: 20px;
              font-weight: bold;
              font-size: 1.2rem;
              display: flex;
              justify-content: space-between;
              border-top: 2px solid #111827;
              padding-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>PURCHASE ORDER RECEIPT</h2>
            <p><strong>PO ID:</strong> ${id}</p>
            <p><strong>Status:</strong> ${STATUS_LABEL[status]}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${items
                  .map(
                    (item) => `
                  <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity ?? "-"}</td>
                      <td>₹${item.unit_price ?? "-"}</td>
                      <td>₹${item.total}</td>
                  </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="total">
            <span>Total Amount</span>
            <span>₹${totalAmount.toFixed(2)}</span>
        </div>

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout>
      {/* Full-screen blocking overlay active during AI extraction */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold mb-2">Processing Invoice</h3>
            <p className="text-sm text-muted-foreground animate-pulse h-6">
              {PROCESSING_STEPS[processStep]}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/purchase-orders")}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <PageHeader
            title={`PO Items (${id})`}
            description={`Total items: ${items.length}`}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseOrderItemsTable items={items} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <span>{items.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Breakdown</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-1"
                >
                  <span>{item.name}</span>
                  <span>₹{item.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {status === "Pending" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Invoice Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isProcessing}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setInvoiceFile(e.target.files[0]);
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setReceiveOpen(true)}
                    disabled={!invoiceFile || isProcessing}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Mark as Received
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setCancelOpen(true)}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                  <Button
                    onClick={handleDownloadReceipt}
                    disabled={isProcessing}
                    className="cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Download PO Details
                  </Button>
                </div>
              </>
            )}

            {status === "Received" && (
              <Button
                disabled={isProcessing}
                className="cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Order Received
              </Button>
            )}

            {status === "Cancelled" && (
              <div className="text-sm text-destructive font-medium">
                Order has been cancelled
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={!!receiveOpen}
        onOpenChange={(o) => !o && setReceiveOpen(false)}
        title="Mark as Received"
        description={`Are you sure you want to mark this order as received?`}
        confirmLabel="Mark as Received"
        variant="default"
        onConfirm={markAsReceived}
      />
      <ConfirmationDialog
        open={!!cancelOpen}
        onOpenChange={(o) => !o && setCancelOpen(false)}
        title="Cancel Order"
        description={`Are you sure you want to cancel this order ?`}
        confirmLabel="Cancel Order"
        variant="destructive"
        onConfirm={cancelOrder}
      />
    </PageLayout>
  );
}
