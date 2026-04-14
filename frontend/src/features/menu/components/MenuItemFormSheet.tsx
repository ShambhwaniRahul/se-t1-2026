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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MENU_CATEGORIES, type MenuItem } from "../data/types";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.coerce.number().gt(0, "Price must be greater than 0"),
  estimatedPrepTime: z.coerce.number().gt(0, "Prep time must be greater than 0"),
  isVeg: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem | null;
  onSave: (data: Omit<MenuItem, "id">) => void;
}

export function MenuItemFormSheet({ open, onOpenChange, item, onSave }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", categoryId: "", price: 0, estimatedPrepTime: 0, isVeg: true },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        item
          ? { name: item.name, categoryId: item.categoryId, price: item.price, estimatedPrepTime: item.estimatedPrepTime, isVeg: item.isVeg }
          : { name: "", categoryId: "", price: 0, estimatedPrepTime: 0, isVeg: true }
      );
    }
  }, [open, item, form]);

  const handleSubmit = (values: FormValues) => {
    onSave(values as Omit<MenuItem, "id">);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</SheetTitle>
          <SheetDescription>
            {item ? "Update the menu item details below." : "Fill in the details for the new menu item."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-6 space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Item name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="categoryId" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MENU_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl><Input type="number" min={0} step={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="estimatedPrepTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (mins)</FormLabel>
                <FormControl><Input type="number" min={0} step={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="isVeg" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="cursor-pointer">Vegetarian</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">{item ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
