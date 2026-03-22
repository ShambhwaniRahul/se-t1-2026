import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VENDORS } from "../data/mockPurchaseOrders";
import { PurchaseOrderItemsTable } from "./PurchaseOrderItemsTable";
import type { POLineItem } from "../data/types";

export function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState("");
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [expectedDelivery, setExpectedDelivery] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POLineItem[]>([]);

  // new line item fields
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const addItem = useCallback(() => {
    const qty = Number(itemQty);
    const price = Number(itemPrice);
    if (!itemName || qty <= 0 || price <= 0) {
      toast.error("Fill in all item fields with valid values");
      return;
    }
    const newItem: POLineItem = {
      id: `new-${Date.now()}`,
      name: itemName,
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    };
    setItems((prev) => [...prev, newItem]);
    setItemName("");
    setItemQty("");
    setItemPrice("");
  }, [itemName, itemQty, itemPrice]);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleSubmit = (asDraft: boolean) => {
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    toast.success(asDraft ? "Draft saved" : "Order submitted");
    navigate("/purchase-orders");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Vendor & dates */}
        <Card>
          <CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {VENDORS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(orderDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={orderDate} onSelect={(d) => d && setOrderDate(d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Expected Delivery</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !expectedDelivery && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDelivery ? format(expectedDelivery, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={expectedDelivery} onSelect={setExpectedDelivery} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Item Name</Label>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Tomatoes (kg)" />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input type="number" min={1} value={itemQty} onChange={(e) => setItemQty(e.target.value)} />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Unit Price</Label>
                <Input type="number" min={0} step={0.01} value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
              </div>
              <Button onClick={addItem} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <PurchaseOrderItemsTable items={items} editable onRemove={removeItem} />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={4} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Grand Total</span>
              <span>${items.reduce((s, i) => s + i.total, 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          <Button onClick={() => handleSubmit(false)}>Submit Order</Button>
          <Button variant="outline" onClick={() => handleSubmit(true)}>Save as Draft</Button>
        </div>
      </div>
    </div>
  );
}
