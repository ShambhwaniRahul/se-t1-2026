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
  id: string;
  vendorId: string;
  poId: string;
  date: string;
  type: PurchaseOrderType;
  status: PurchaseOrderStatus;
  deliveryCost: number;
}
