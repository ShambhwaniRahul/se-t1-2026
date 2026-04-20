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
<<<<<<< Updated upstream:frontend/src/features/vendors/data/types.ts
  deliveryCost: number;
}
=======
  delivery_cost: number;
  file_location: string;
  items_total: string;
  grand_total: string;
  created_at: string;
  updated_at: string;
}


export type POStatus = "Pending" | "Received" | "Cancelled";

export interface POLineItem {
  id: String;
  sku: number;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}



// [
  // "vendor": 0,
  // "purchase_type": "Perishable",
  // "purchase_date": "2026-04-19",
  // "status": "Pending",
  // "delivery_cost": 0
// ]
>>>>>>> Stashed changes:frontend/src/config/types/vendor.ts
