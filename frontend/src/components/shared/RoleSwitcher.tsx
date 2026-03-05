import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/types/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles: AppRole[] = ["admin", "manager", "kitchen", "pos"];

export function RoleSwitcher() {
  const { role, setRole } = useAuth();

  return (
    <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
      <SelectTrigger className="h-8 w-[140px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((r) => (
          <SelectItem key={r} value={r} className="text-xs">
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
