export type AppRole = "admin" | "manager" | "kitchen" | "pos" | "procurement";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  kitchen: "Kitchen",
  pos: "POS Operator",
  procurement: "Procurement",
};
