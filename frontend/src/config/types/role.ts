// =======================
// ROLE DEFINITIONS
// =======================
export const ROLES = {
  OWNER: { value: "Owner", label: "Owner" },
  MANAGER: { value: "Manager", label: "Manager" },
  CHEF: { value: "Chef", label: "Chef" },
  WAITER: { value: "Waiter", label: "Waiter" },
  INVENTORY_MANAGER: { value: "Inventory Manager", label: "Inventory Manager" },
  OTHER: { value: "Other", label: "Other" }
  // ACCOUNTS: { value: "accounts", label: "Accounts" },
  // HOUSEKEEPING: { value: "housekeeping", label: "Housekeeping" },
  // WATCHMAN: { value: "watchman", label: "Watchman" },
} as const;


export type AppRole = (typeof ROLES)[keyof typeof ROLES]["value"];

const { OWNER, MANAGER, CHEF, WAITER, INVENTORY_MANAGER, OTHER } = ROLES;


// =======================
// ROUTE ACCESS CONTROL
// =======================
export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  "/": [OWNER.value, MANAGER.value],
  "/pos": [OWNER.value, MANAGER.value, WAITER.value],
  "/kitchen": [OWNER.value, MANAGER.value, CHEF.value],
  "/inventory": [OWNER.value, MANAGER.value, INVENTORY_MANAGER.value],
  "/purchase-orders": [OWNER.value, MANAGER.value, INVENTORY_MANAGER.value],
  "/crm": [OWNER.value, MANAGER.value],
  "/analytics": [OWNER.value, MANAGER.value],
  "/erp": [OWNER.value, MANAGER.value],
  "/settings": [OWNER.value],
  "/vendors": [OWNER.value, MANAGER.value, INVENTORY_MANAGER.value],
  "/menu": [OWNER.value, MANAGER.value],
};


// =======================
// ROLE HOME ROUTES
// =======================
export const ROLE_HOME: Record<AppRole, string> = {
  [OWNER.value]: "/",
  [MANAGER.value]: "/",
  [WAITER.value]: "/pos",
  [CHEF.value]: "/kitchen",
  [INVENTORY_MANAGER.value]: "/purchase-orders",
  [OTHER.value]: "/login"
};


// =======================
// EMPLOYEE TYPE
// =======================
export interface Employee {
  id: number;

  first_name: string;
  last_name: string;
  full_name: string;

  gender: number;
  gender_display: string;

  email: string;
  phone_no: string;

  monthly_salary: number;

  joining_date: string; // ISO date
  leaving_date: string | null;

  is_working: boolean;
  is_staff: boolean;

  roles: {"role_display": AppRole}[];

  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}