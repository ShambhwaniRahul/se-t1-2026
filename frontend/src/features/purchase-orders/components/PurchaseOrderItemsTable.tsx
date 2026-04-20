import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { POLineItem } from "@/config/types/vendor";

interface Props {
  items: POLineItem[];
  editable?: boolean;
  onRemove?: (id: string) => void;
}

export function PurchaseOrderItemsTable({ items, editable, onRemove }: Props) {
  const grandTotal = items.reduce((s, i) => s + i.total, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {editable && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={editable ? 5 : 4} className="text-center text-muted-foreground py-8">
                No items added yet
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={String(item.id)}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">₹ {item.unit_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">₹ {item.total.toFixed(2)}</TableCell>
              {editable && (
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onRemove?.(String(item.id))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={editable ? 3 : 3} className="font-semibold">
              Grand Total
            </TableCell>
            <TableCell className="text-right font-semibold">
              ₹ {grandTotal.toFixed(2)}
            </TableCell>
            {editable && <TableCell />}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
