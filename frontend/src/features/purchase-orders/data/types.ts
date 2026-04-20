// export type POStatus = "draft" | "ordered" | "delivered" | "cancelled";

// export interface POLineItem {
//   id: string;
//   name: string;
//   quantity: number;
//   unitPrice: number;
//   total: number;
// }

<<<<<<< Updated upstream
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
=======
// export interface Vendor {
//   id: string;
//   name: string;
//   contact: string;
//   email: string;
//   phone: string;
// }

// export interface PurchaseOrder{
//   id: number,
//   vendor: number,
//   vendor_name: string,
//   purchase_type: "Perishable" | "Non-Perishable",
//   purchase_date: string,
//   status: "Pending" | "Approved" | "Rejected",
//   delivery_cost: number,
//   file_location: string,
//   created_at: string,
//   updated_at: string
// }


// {
//   "id": 0,
//   "vendor": 0,
//   "vendor_name": "string",
//   "purchase_type": "Perishable",
//   "purchase_date": "2026-04-19",
//   "status": "Pending",
//   "delivery_cost": 0,
//   "file_location": "string",
//   "created_at": "2026-04-19T15:10:59.553Z",
//   "updated_at": "2026-04-19T15:10:59.553Z"
// }
>>>>>>> Stashed changes
