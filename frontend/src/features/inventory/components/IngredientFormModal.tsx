import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ingredient, IngredientCategory } from "../data/inventoryData";
import { INGREDIENT_CATEGORIES, SUPPLIERS } from "../data/inventoryData";

interface IngredientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient?: Ingredient | null;
  onSave: (data: Omit<Ingredient, "id">) => void;
}

const UNITS = ["kg", "L", "pcs", "heads", "bags", "boxes"];

export function IngredientFormModal({
  open,
  onOpenChange,
  ingredient,
  onSave,
}: IngredientFormModalProps) {
  const isEdit = !!ingredient;

  const [name, setName] = useState(ingredient?.name ?? "");
  const [category, setCategory] = useState<IngredientCategory>(ingredient?.category ?? "proteins");
  const [unit, setUnit] = useState(ingredient?.unit ?? "kg");
  const [currentStock, setCurrentStock] = useState(String(ingredient?.currentStock ?? "0"));
  const [minStock, setMinStock] = useState(String(ingredient?.minStock ?? "10"));
  const [costPerUnit, setCostPerUnit] = useState(String(ingredient?.costPerUnit ?? "0"));
  const [supplier, setSupplier] = useState(ingredient?.supplier ?? SUPPLIERS[0]);

  // Reset form when modal opens with different ingredient
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      category,
      unit,
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      costPerUnit: Number(costPerUnit),
      supplier,
      lastRestocked: ingredient?.lastRestocked ?? new Date().toISOString().split("T")[0],
    });
    handleOpenChange(false);
  };

  const isValid = name.trim().length > 0 && Number(currentStock) >= 0 && Number(minStock) >= 0;

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Edit Ingredient" : "Add Ingredient"}
      description={isEdit ? "Update ingredient details." : "Add a new ingredient to inventory."}
      className="sm:max-w-lg"
      footer={
        <div className="flex w-full gap-2 justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isEdit ? "Save Changes" : "Add Ingredient"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="ing-name">Name</Label>
          <Input id="ing-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beef Patties" />
        </div>

        {/* Category + Unit row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as IngredientCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INGREDIENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stock row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ing-stock">Current Stock</Label>
            <Input id="ing-stock" type="number" min="0" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ing-min">Min Stock (alert threshold)</Label>
            <Input id="ing-min" type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
          </div>
        </div>

        {/* Cost + Supplier row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ing-cost">Cost / Unit (₹)</Label>
            <Input id="ing-cost" type="number" min="0" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUPPLIERS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
