export interface Vendor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  address: string;
  gst_no: string;
}


export type VendorFormValues = Omit<Vendor, "id">;

export type PurchaseOrderType = "Perishable" | "Non-Perishable";
export type PurchaseOrderStatus = "Pending" | "Received" | "Cancelled";

export interface VendorPurchaseOrder {
  id: number;
  vendor: number;
  vendor_name: string;
  purchase_type: PurchaseOrderType;
  purchase_date: string;
  status: PurchaseOrderStatus;
  delivery_cost: number;
  file_location: string;
  created_at: string;
  updated_at: string;
}

