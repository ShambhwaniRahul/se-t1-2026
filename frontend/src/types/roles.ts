export type AppRole = "owner" | "manager" | "kitchen" | "pos" | "procurement";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AppRole;
  department: string;
  status: "active" | "disabled";
}

export const ROLE_LABELS: Record<AppRole, string> = {
  owner: "Owner",
  manager: "Manager",
  kitchen: "Kitchen",
  pos: "POS Operator",
  procurement: "Procurement",
};

export const ALL_ROLES: AppRole[] = ["owner", "manager", "kitchen", "pos", "procurement"];
