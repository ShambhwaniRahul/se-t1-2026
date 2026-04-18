import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Vendor, VendorFormValues } from "../data/types";

const vendorSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50),
  last_name: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Invalid email address"),
  contact_no: z.string().trim().min(1, "Contact number is required").max(20),
  address: z.string().trim().min(1, "Address is required").max(300),
  gst_no: z
    .string()
    .trim()
    .min(1, "GST number is required")
    .refine((val) => val.startsWith("GSTIN"), { message: "Must start with 'GSTIN'" })
    .refine((val) => val.length === 15, { message: "Must be exactly 15 characters (e.g. GSTIN1234567890)" }),
});

interface VendorFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSubmit: (values: VendorFormValues) => void;
}

export function VendorFormSheet({ open, onOpenChange, vendor, onSubmit }: VendorFormSheetProps) {
  const isEditing = !!vendor;

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      contact_no: "",
      address: "",
      gst_no: "",
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        first_name: vendor.first_name,
        last_name: vendor.last_name,
        email: vendor.email,
        contact_no: vendor.contact_no,
        address: vendor.address,
        gst_no: vendor.gst_no,
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        contact_no: "",
        address: "",
        gst_no: "",
      });
    }
  }, [vendor, open, form]);

  const handleSubmit = (values: VendorFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Vendor" : "Add Vendor"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update vendor information below." : "Fill in the details to add a new vendor."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input placeholder="Rajesh" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input placeholder="Kumar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="vendor@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact No</FormLabel>
                  <FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea placeholder="Full address…" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gst_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl><Input placeholder="Ex: GSTIN1234567890" maxLength={15} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update Vendor" : "Add Vendor"}</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
