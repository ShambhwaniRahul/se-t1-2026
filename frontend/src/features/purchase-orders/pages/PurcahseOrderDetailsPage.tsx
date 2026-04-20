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

const STATUS_VARIANT: Record<POStatus, StatusBadgeVariant> = {
  Pending: "warning",
  Received: "success", // (Delivered UI name ho sakta hai, but backend = Received)
  Cancelled: "destructive",
};

const STATUS_LABEL: Record<POStatus, string> = {
  Pending: "Pending",
  Received: "Delivered", // UI friendly label
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

  const markAsReceived = async () => {
    try {
      const res = await api.post(`/procurement/purchase-orders/${id}/receive/`);

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

  const action = (label: string) => () => {
    toast.success(`Order ${label.toLowerCase()}`);
    navigate("/purchase-orders");
  };

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
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseOrderItemsTable items={items} />
            </CardContent>
          </Card>

          {/* Simple Summary instead of timeline */}
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

        {/* Sidebar */}
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

          {/* <div className="flex flex-col gap-2">
            {items?.length > 0 && (
              <>
                <Button onClick={()=>{setReceiveOpen(true)}} className="cursor-pointer">
                  <Package className="h-4 w-4 mr-1" />
                  Mark as Received
                </Button>

                <Button variant="destructive" onClick={()=>{setCancelOpen(true)}} className="cursor-pointer">
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Order
                </Button>
              </>
            )}
          </div> */}
          <div className="flex flex-col gap-2">
            {status === "Pending" && (
              <>
                <Button onClick={() => setReceiveOpen(true)}>
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
