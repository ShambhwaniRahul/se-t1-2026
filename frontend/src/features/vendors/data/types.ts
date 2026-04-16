export interface Vendor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  address: string;
  gstNumber: string;
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
