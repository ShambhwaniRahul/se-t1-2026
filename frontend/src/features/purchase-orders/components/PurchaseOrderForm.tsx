import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PurchaseOrderItemsTable } from "./PurchaseOrderItemsTable";
import type { POLineItem } from "@/config/types/vendor";
import { useEffect } from "react";
import api from "@/lib/api";

export function PurchaseOrderForm() {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState("");
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POLineItem[]>([]);

  // new line item fields
  const [itemName, setItemName] = useState<string | undefined>(undefined);
  const [itemQty, setItemQty] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  // Getting the list of SKUs
  const [skus, setSkus] = useState<any[]>([]);

  // The PO Type:
  const [purchaseType, setPurchaseType] = useState<
    "Perishable" | "Non-Perishable"
  >();

  // The list of Vendors:
  const [vendors, setVendors] = useState<any[]>([]); // 🔥 add this
  const [loading, setLoading] = useState(true); // optional but good

  const handlePurchaseTypeChange = (value: "Perishable" | "Non-Perishable") => {
    setPurchaseType(value); // 🔥 set selected type

    // 🔥 Reset dependent states (VERY IMPORTANT)
    setItems([]); // clear added items
    setItemName(undefined); // clear selected SKU
    setItemQty(""); // clear qty input
    setItemPrice(""); // clear price input

    setSkus([]); // optional: clear old SKUs (avoids flicker/mix)
  };

  const fetchVendors = async () => {
    try {
      const result = await api.get("/procurement/vendors");

      if (result.data.success) {
        console.log("✅✅The Vendors:", result.data.data);
        setVendors(result.data.data); // 🔥 set vendors
        toast.success(result.data.message || "Vendors fetched successfully");
      } else {
        toast.error(result.data.message || "Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (!purchaseType) return;

    const fetchSKUs = async () => {
      try {
        const endpoint =
          purchaseType === "Perishable"
            ? "/inventory/perishable-skus/"
            : "/inventory/non-perishable-inventory/";

        const result = await api.get(endpoint);

        if (result.data.success) {
          setSkus(result.data.data);
          console.log("✅✅The SKUs:", result.data.data);
          toast.success(result.data.message || "SKUs fetched successfully");
        } else {
          toast.error(result.data.message || "Failed to fetch SKUs");
        }
      } catch (error) {
        console.error("Error fetching SKUs:", error);
        toast.error("Failed to fetch SKUs");
      }
    };

    fetchSKUs();
  }, [purchaseType]);

  const addItem = useCallback(() => {
    const qty = Number(itemQty);
    const price = Number(itemPrice);
    if (!itemName || qty <= 0 || price <= 0) {
      toast.error("Fill in all item fields with valid values");
      return;
    }
    const newItem: POLineItem = {
      id: `new-${Date.now()}`,
      sku: itemName,
      name: itemName,
      quantity: qty,
      unit_price: price,
      total: qty * price,
    };
    setItems((prev) => [...prev, newItem]);
    setItemName(undefined);
    setItemQty("");
    setItemPrice("");
  }, [itemName, itemQty, itemPrice]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const handleSubmit = async () => {
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }

    if (!purchaseType) {
      toast.error("Please select purchase type");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    try {
      const payload = {
        vendor: Number(vendorId),
        purchase_type: purchaseType,
        purchase_date: format(orderDate, "yyyy-MM-dd"),

        skus: items.map((item) => ({
          sku: Number(item.sku), // 🔥 IMPORTANT: item.sku = SKU ID
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      console.log("🔥 Payload:", payload);

      const res = await api.post("/procurement/purchase-orders/", payload);

      if (res.data.success) {
        toast.success("Purchase Order created successfully");
        navigate("/purchase-orders");
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error(err);

      if (err.response) {
        toast.error(err.response.data?.message || "Failed to create PO");
      } else {
        toast.error("Network error");
      }
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Vendor & dates */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>

          {/* 🔥 CHANGED: grid-cols-3 → grid-cols-4 */}
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {/* Vendor */}
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Select
                value={vendorId}
                onValueChange={(value) => setVendorId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(
                    (
                      v, // 🔥 Changed from VENDORS → vendors
                    ) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.first_name} {v.last_name}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 🔥 ADDED: Purchase Type */}
            <div className="space-y-2">
              <Label>Purchase Type</Label>
              <Select
                value={purchaseType}
                onValueChange={handlePurchaseTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perishable">Perishable</SelectItem>
                  <SelectItem value="Non-Perishable">Non-Perishable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Date */}
            <div className="space-y-2">
              <Label>Order Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(orderDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={(d) => d && setOrderDate(d)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Item Name</Label>

                {/* 🔥 OPTIONAL: disable until purchaseType selected */}
                <Select
                  value={itemName}
                  onValueChange={setItemName}
                  disabled={!purchaseType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select SKU" />
                  </SelectTrigger>

                  <SelectContent>
                    {skus.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24 space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                />
              </div>

              <div className="w-28 space-y-1">
                <Label className="text-xs">Unit Price</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
              </div>

              <Button onClick={addItem} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <PurchaseOrderItemsTable
              items={items}
              editable
              onRemove={removeItem}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="font-medium">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Grand Total</span>
              <span>₹ {items.reduce((s, i) => s + i.total, 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button onClick={() => handleSubmit()}>Order</Button>
          <Button
            variant="outline"
            onClick={() => navigate("/purchase-orders")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
