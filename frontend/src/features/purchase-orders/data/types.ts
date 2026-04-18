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