import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CustomerInfo } from "../data/types";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";

interface CustomerInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (customer: CustomerInfo) => void;
}

export function CustomerInfoModal({ open, onOpenChange, onContinue }: CustomerInfoModalProps) {
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    if (open) {
      setPhone("");
      setCustomer(null);
      setIsNew(false);
      setForm({ first_name: "", last_name: "" });
    }
  }, [open]);

  const handleSearch = async () => {
    if (!phone) return toast.error("Enter phone number");

    setLoading(true);
    try {
      const res = await api.get("/customers/auth/search/", { params: { phone_no: phone } });

      if (res.data.success && res.data.data.length > 0) {
        setCustomer(res.data.data[0]);
        setIsNew(false);
      } else {
        setCustomer(null);
        setIsNew(true);
      }
    } catch (err) {
      toast.error("Failed to search customer");
      console.log("Failed to search customer", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      let finalCustomer = customer;

      if (isNew) {
        if (!form.first_name) {
          toast.error("First name required");
          return;
        }

        const res = await api.post("/customers/auth/register/", {
          ...form,
          phone_no: phone,
        });

        if (!res.data.success) throw new Error();

        finalCustomer = {
          ...res.data.data,
          total_points: 0,
          total_visits: 0,
          total_spent: 0,
          last_visit: null,
        };

        console.log(">>> CUSTOMER DETAILS: ", finalCustomer)
      }

      if (!finalCustomer) return;

      onContinue(finalCustomer);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to continue");
      console.log(">>> Failed to continue", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Search a customer to apply loyalty rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Phone Number</Label>
            <Input
              className="mt-2"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </div>

        {/* Existing Customer */}

        {customer && !isNew && (
          <>
            <Separator />
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="text-base font-semibold">
                    {customer.first_name} {customer.last_name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="text-lg font-bold text-primary">
                    {customer.total_points}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{customer.phone_no}</span>
              </div>
            </div>
          </>
        )}

        {/* New Customer */}
        {isNew && (
          <div className="space-y-2">
            <Input
              placeholder="First Name"
              value={form.first_name}
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
            />
            <Input
              placeholder="Last Name"
              value={form.last_name}
              onChange={(e) =>
                setForm({ ...form, last_name: e.target.value })
              }
            />
          </div>
        )}

        {(customer || isNew) && (
          <DialogFooter>
            <Button onClick={handleContinue} disabled={loading}>
              {isNew ? "Register & Pay" : "Proceed to Pay"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// return (
//   <Dialog open={open} onOpenChange={onOpenChange}>
//     <DialogContent className="sm:max-w-md">
//       <DialogHeader>
//         <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
//           <UserPlus className="h-5 w-5 text-primary" />
//         </div>
//         <DialogTitle>Customer details</DialogTitle>
//         <DialogDescription>
//           Add the customer to apply loyalty rewards on this order.
//         </DialogDescription>
//       </DialogHeader>

//       <div className="grid gap-4 py-2">
//         <div className="space-y-1.5">
//           <Label htmlFor="phone">Phone number</Label>
//           <Input
//             id="phone"
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//           />
//           {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
//         </div>
//       </div>

//       <Separator />

//       { (customer !== null) &&
//         <>
//           <div className="grid gap-4 py-2">
//             <p>Name: {customer.first_name} {customer.last_name}</p>
//             <p>Phone Number: {customer.phone_no}</p>
//             <p>Loyalty Points: {customer.total_points}</p>
//           </div>

//           <DialogFooter className="flex-row gap-2 sm:gap-2">
//             <Button className="flex-1 min-h-[44px]" onClick={(e) => resolveCustomer(e)}>
//               Continue to payment
//             </Button>
//           </DialogFooter>
//         </>
//       }
//     </DialogContent>
//   </Dialog>
// );
// }
