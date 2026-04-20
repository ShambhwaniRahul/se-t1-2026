import type { OrderMenuItem } from "@/config/types/order";

export type KitchenStatus =
  | "pending"
  | "in_progress"
  | "ready"
  | "served"
  | "cancelled"
  | "rejected";

export const STATUS_TO_BACKEND: Record<KitchenStatus, number> = {
  pending: 0,
  in_progress: 1,
  ready: 2,
  served: 3,
  cancelled: 4,
  rejected: 5,
};

export const STATUS_MAP: Record<string, KitchenStatus> = {
  "Pending": "pending",
  "In Progress": "in_progress",
  "Ready to Serve": "ready",
  "Served": "served",
  "Cancelled": "cancelled",
  "Rejected": "rejected",
};

export type KitchenItem = OrderMenuItem & {
  status: KitchenStatus;
};

export const KITCHEN_COLUMNS: {
  id: KitchenStatus;
  label: string;
  accent: "default" | "destructive" | "secondary" | "outline";
}[] = [
    { id: "pending", label: "🔴 New", accent: "destructive" },
    { id: "in_progress", label: "🟡 Preparing", accent: "secondary" },
    { id: "ready", label: "🟢 Ready", accent: "default" },
  ];