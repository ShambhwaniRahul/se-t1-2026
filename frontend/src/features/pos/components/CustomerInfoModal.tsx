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


interface CustomerInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (customer: CustomerInfo) => void;
  isLoading: boolean;
}

export function CustomerInfoModal({ open, onOpenChange, onContinue}: CustomerInfoModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFirstName("");
      setLastName("");
      setPhone("");
      setErrors({});
    }
  }, [open]);

  const handleContinue = () => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) next.phone = "Enter a valid phone number";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onContinue({ first_name: firstName.trim(), last_name: lastName.trim(), phone_no: phone.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>Customer details</DialogTitle>
          <DialogDescription>
            Add the customer to apply loyalty rewards on this order.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button className="flex-1 min-h-[44px]" onClick={handleContinue}>
            Continue to payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
