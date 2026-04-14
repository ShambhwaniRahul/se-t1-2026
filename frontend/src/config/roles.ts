import type { AppRole } from "@/types/roles";

/** Which roles can access which route prefixes */
export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  "/": ["owner", "manager"],
  "/pos": ["owner", "manager", "pos"],
  "/kitchen": ["owner", "manager", "kitchen"],
  "/inventory": ["owner", "manager", "procurement"],
  "/purchase-orders": ["owner", "manager", "procurement"],
  "/crm": ["owner", "manager"],
  "/analytics": ["owner", "manager"],
  "/erp": ["owner", "manager"],
  "/settings": ["owner"],
  "/vendors": ["owner", "manager", "procurement"],
  "/menu": ["owner", "manager"]
};

/** Default landing page per role after login */
export const ROLE_HOME: Record<AppRole, string> = {
  owner: "/",
  manager: "/",
  pos: "/pos",
  kitchen: "/kitchen",
  procurement: "/purchase-orders",
};
