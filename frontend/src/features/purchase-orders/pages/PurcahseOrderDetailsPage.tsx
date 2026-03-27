import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, XCircle, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge, type StatusBadgeVariant } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MOCK_PURCHASE_ORDERS } from "../data/mockPurchaseOrders";
import { PurchaseOrderItemsTable } from "../components/PurchaseOrderItemsTable";
import type { POStatus } from "../data/types";

const STATUS_VARIANT: Record<POStatus, StatusBadgeVariant> = {
  draft: "muted",
  ordered: "info",
  delivered: "success",
  cancelled: "destructive",
};

const STATUS_LABEL: Record<POStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const po = MOCK_PURCHASE_ORDERS.find((p) => p.id === id);

  if (!po) {
    return (
      <PageLayout>
        <PageHeader title="Not Found" description="This purchase order does not exist" />
        <Button variant="outline" onClick={() => navigate("/purchase-orders")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </PageLayout>
    );
  }

  const action = (label: string) => () => {
    toast.success(`Order ${label.toLowerCase()}`);
    navigate("/purchase-orders");
  };

  return (
    <PageLayout>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/purchase-orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader
            title={po.poNumber}
            description={`Order to ${po.vendor.name}`}
            actions={<StatusBadge variant={STATUS_VARIANT[po.status]}>{STATUS_LABEL[po.status]}</StatusBadge>}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader><CardTitle>Items Ordered</CardTitle></CardHeader>
            <CardContent>
              <PurchaseOrderItemsTable items={po.items} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Order Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative border-l border-border ml-3 space-y-4">
                {po.timeline.map((entry, i) => (
                  <li key={i} className="ml-6">
                    <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="text-sm font-medium">{STATUS_LABEL[entry.status]}</span>
                      <span className="text-xs text-muted-foreground">— {entry.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.note}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Vendor</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{po.vendor.name}</p>
              <p className="text-muted-foreground">{po.vendor.contact}</p>
              <p className="text-muted-foreground">{po.vendor.email}</p>
              <p className="text-muted-foreground">{po.vendor.phone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Order Date</span><span>{po.orderDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Delivery</span><span>{po.expectedDelivery}</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><span>${po.totalAmount.toLocaleString()}</span></div>
            </CardContent>
          </Card>

          {/* Action buttons based on status */}
          <div className="flex flex-col gap-2">
            {po.status === "draft" && (
              <Button onClick={action("Submitted")}>
                <Package className="h-4 w-4 mr-1" /> Mark as Ordered
              </Button>
            )}
            {po.status === "ordered" && (
              <Button onClick={action("Delivered")} variant="default">
                <Truck className="h-4 w-4 mr-1" /> Mark as Delivered
              </Button>
            )}
            {(po.status === "draft" || po.status === "ordered") && (
              <Button variant="destructive" onClick={action("Cancelled")}>
                <XCircle className="h-4 w-4 mr-1" /> Cancel Order
              </Button>
            )}
            {po.status === "delivered" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" /> Order complete
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
