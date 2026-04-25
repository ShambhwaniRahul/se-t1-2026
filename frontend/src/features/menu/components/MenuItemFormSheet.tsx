import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { MENU_CATEGORIES, type MenuItem } from "../../../config/types/order";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().gt(0, "Price must be greater than 0"),
  estimated_prep_time: z.coerce.number().gt(0, "Prep time must be greater than 0"),
  discount: z.coerce.number().min(0, "Discount cannot be negative").default(0),
  is_veg: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  onSave: (data: any) => void;
}

export function MenuItemFormSheet({ open, onOpenChange, item, onSave }: Props) {

  const form = useForm<FormInput, any, FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? {
            name: item.name,
            category: String(item.category),
            price: item.price.toString(),
            estimated_prep_time: item.estimated_prep_time.toString(),
            discount: item.discount.toString(),
            is_veg: item.is_veg,
          }
          : {
            name: "",
            category: "",
            price: "",
            estimated_prep_time: "",
            discount: "0",
            is_veg: true,
          }
      );
    }
  }, [open, item, form]);

  const handleSubmit = (values: FormValues) => {
    onSave(values);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</SheetTitle>
          <SheetDescription>
            {item ? "Update the menu item details below." : "Fill in the details for the new menu item."}
          </SheetDescription>
        </SheetHeader>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Item name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MENU_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString?.() ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="discount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value?.toString?.() ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="estimated_prep_time" render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (mins)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value?.toString?.() ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="is_veg" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="cursor-pointer">Vegetarian</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">{item ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          </form>
        </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
