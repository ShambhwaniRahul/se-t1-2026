export type POStatus = "draft" | "ordered" | "delivered" | "cancelled";

export interface POLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: Vendor;
  orderDate: string;
  expectedDelivery: string;
  items: POLineItem[];
  totalAmount: number;
  status: POStatus;
  notes?: string;
  timeline: { date: string; status: POStatus; note: string }[];
}
