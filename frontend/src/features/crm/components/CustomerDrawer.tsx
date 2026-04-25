import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ShoppingBag,
  Phone,
  CalendarDays,
} from "lucide-react";
import type { Customer } from "../data/crmData";
import type { CustomerOrderResponse } from "../data/crmData";

interface CustomerDrawerProps {
  customer: Customer | null;
  orders: CustomerOrderResponse[];
  loadingOrders: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDrawer({
  customer,
  orders,
  loadingOrders,
  open,
  onOpenChange,
}: CustomerDrawerProps) {
  if (!customer) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">

        {/* HEADER */}
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl">
            {customer.first_name} {customer.last_name}
          </SheetTitle>
        </SheetHeader>

        {/* CONTACT + STATS */}
        <div className="px-6 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{customer.phone_no}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                Joined {format(new Date(customer.created_at), "MMM yyyy")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                Last visit{" "}
                {customer.last_visit
                  ? format(new Date(customer.last_visit), "MMM d")
                  : "—"}
              </span>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <Star className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg font-bold">
                {customer.total_points}
              </p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>

            <div className="rounded-lg border p-3 text-center">
              <ShoppingBag className="h-4 w-4 mx-auto mb-1" />
              <p className="text-lg font-bold">
                {customer.total_visits}
              </p>
              <p className="text-xs text-muted-foreground">Visits</p>
            </div>

            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Total Spent
              </p>
              <p className="text-lg font-bold">
                ₹ {(customer.total_spent).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* ORDERS */}
        <Tabs defaultValue="orders" className="px-6 pt-4 pb-6">
          <TabsList className="w-full">
            <TabsTrigger value="orders" className="flex-1 gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4 space-y-3">

            {/* 🔥 LOADER */}
            {loadingOrders ? (
              <p className="text-center text-muted-foreground py-6">
                Loading orders...
              </p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No orders found.
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.order_id}
                  className="rounded-lg border p-3 space-y-1.5"
                >
                  <div className="flex justify-between">
                    <span className="font-mono text-sm">
                      #{order.order_id}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </p>

                  <p className="text-sm">
                    {order.order_items.join(", ")}
                  </p>

                  <p className="text-sm font-semibold">
                    ₹ {order.total_amount}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

      </SheetContent>
    </Sheet>
  );
}
