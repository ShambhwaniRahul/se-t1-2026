import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, XCircle, CheckCircle2 } from "lucide-react";
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

// Maintains consistency with standard application status variants
const STATUS_VARIANT: Record<POStatus, StatusBadgeVariant> = {
  Pending: "warning",
  Received: "success",
  Cancelled: "destructive",
};

// Maps backend enumeration to frontend display nomenclature
const STATUS_LABEL: Record<POStatus, string> = {
  Pending: "Pending",
  Received: "Delivered",
  Cancelled: "Cancelled",
};

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [status, setStatus] = useState<POStatus>("Pending");
  
  // Tracks the physical invoice image required for successful receipt processing
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // Constructs multipart payload containing invoice proof and purchase reference
  const markAsReceived = async () => {
    if (!invoiceFile) {
      toast.error("Invoice image is required to mark order as received");
      return;
    }

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
      setReceiveOpen(false);
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
        toast.success(res.data.message);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/purchase-orders")}
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
                    disabled={!invoiceFile}
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Mark as Received
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => setCancelOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                </div>
              </>
            )}

            {status === "Received" && (
              <Button>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Download Receipt
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