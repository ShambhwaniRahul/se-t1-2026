import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PerishableSKU } from "../data/type";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PerishableSKU, "id">) => void;
  initialData?: PerishableSKU | null;
}

export function PerishableSkuModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: Props) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<PerishableSKU["unit"]>("KG");
  const [shelfLife, setShelfLife] = useState(0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUnit(initialData.unit);
      setShelfLife(initialData.typical_shelf_life);
    } else {
      setName("");
      setUnit("KG");
      setShelfLife(0);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      unit,
      typical_shelf_life: shelfLife,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update SKU" : "Create SKU"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* NAME */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tomato"
            />
          </div>

          {/* UNIT */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Unit</label>
            <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KG">KG</SelectItem>
                <SelectItem value="L">Liters</SelectItem>
                <SelectItem value="Pc">Pieces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SHELF LIFE */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Typical Shelf Life (days)
            </label>
            <Input
              type="number"
              value={shelfLife}
              onChange={(e) => setShelfLife(Number(e.target.value))}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
