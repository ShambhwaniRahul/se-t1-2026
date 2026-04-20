import type { VendorPurchaseOrder } from "@/config/types/vendor";
import type { Vendor } from "@/config/types/vendor";


export const VENDORS: Vendor[] = [
  { id: 1, first_name: "FreshFarms Co.", last_name: "sjcd", email: "sarah@freshfarms.co", contact_no: "+1 555-0101",address: "123 Long Farm", gst_no: "GST123456" },
  { id: 2, first_name: "Metro Supplies", last_name: "", email: "james@metrosupplies.com", contact_no: "+1 555-0202", address: "456 Business Ave", gst_no: "GST789012" },
  { id: 3, first_name: "Ocean Catch Ltd.", last_name: "", email: "maria@oceancatch.com", contact_no: "+1 555-0303", address: "789 Seafood Blvd", gst_no: "GST345678" },
  { id: 4, first_name: "Baker's Best", last_name: "", email: "tom@bakersbest.com", contact_no: "+1 555-0404", address: "321 Bakery St", gst_no: "GST901234" },
  { id: 5, first_name: "SpiceWorld Inc.", last_name: "", email: "priya@spiceworld.com", contact_no: "+1 555-0505", address: "654 Spice Rd", gst_no: "GST567890" },
];

// export interface Vendor {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   contact_no: string;
//   address: string;
//   gst_no: string;
// }

// export interface VendorPurchaseOrder {
//   id: number;
//   vendor: number;
//   vendor_name: string;
//   purchase_type: PurchaseOrderType;
//   purchase_date: string;
//   status: PurchaseOrderStatus;
//   delivery_cost: number;
//   file_location: string;
//   created_at: string;
//   updated_at: string;
// }

export const MOCK_PURCHASE_ORDERS: VendorPurchaseOrder[] = [
  {
    id: 1,
    vendor: VENDORS[0].id,
    orderDate: "2026-03-15",
    expectedDelivery: "2026-03-18",
    items: [
      { id: "li-1", name: "Tomatoes (kg)", quantity: 50, unitPrice: 3.5, total: 175 },
      { id: "li-2", name: "Lettuce (head)", quantity: 30, unitPrice: 2.0, total: 60 },
      { id: "li-3", name: "Onions (kg)", quantity: 25, unitPrice: 2.8, total: 70 },
    ],
    totalAmount: 305,
    status: "pending",
    timeline: [
      { date: "2026-03-15", status: "draft", note: "Order drafted" },
      { date: "2026-03-15", status: "ordered", note: "Submitted to vendor" },
      { date: "2026-03-18", status: "delivered", note: "Received in full" },
    ],
  },
  {
    id: "po-2",
    poNumber: "PO-2026-002",
    vendor: VENDORS[1],
    orderDate: "2026-03-17",
    expectedDelivery: "2026-03-20",
    items: [
      { id: "li-4", name: "Napkins (pack)", quantity: 100, unitPrice: 1.5, total: 150 },
      { id: "li-5", name: "Cleaning spray (bottle)", quantity: 20, unitPrice: 8.0, total: 160 },
    ],
    totalAmount: 310,
    status: "ordered",
    timeline: [
      { date: "2026-03-17", status: "draft", note: "Order drafted" },
      { date: "2026-03-17", status: "ordered", note: "Submitted to vendor" },
    ],
  },
  {
    id: "po-3",
    poNumber: "PO-2026-003",
    vendor: VENDORS[2],
    orderDate: "2026-03-19",
    expectedDelivery: "2026-03-22",
    items: [
      { id: "li-6", name: "Salmon fillet (kg)", quantity: 15, unitPrice: 24.0, total: 360 },
      { id: "li-7", name: "Shrimp (kg)", quantity: 10, unitPrice: 18.0, total: 180 },
      { id: "li-8", name: "Cod fillet (kg)", quantity: 12, unitPrice: 16.0, total: 192 },
    ],
    totalAmount: 732,
    status: "ordered",
    timeline: [
      { date: "2026-03-19", status: "draft", note: "Order drafted" },
      { date: "2026-03-19", status: "ordered", note: "Submitted to vendor" },
    ],
  },
  {
    id: "po-4",
    poNumber: "PO-2026-004",
    vendor: VENDORS[3],
    orderDate: "2026-03-20",
    expectedDelivery: "2026-03-23",
    items: [
      { id: "li-9", name: "Flour (25kg bag)", quantity: 5, unitPrice: 22.0, total: 110 },
      { id: "li-10", name: "Sugar (10kg bag)", quantity: 3, unitPrice: 15.0, total: 45 },
      { id: "li-11", name: "Butter (kg)", quantity: 10, unitPrice: 9.0, total: 90 },
      { id: "li-12", name: "Yeast (pack)", quantity: 20, unitPrice: 3.0, total: 60 },
    ],
    totalAmount: 305,
    status: "draft",
    timeline: [
      { date: "2026-03-20", status: "draft", note: "Order drafted" },
    ],
  },
  {
    id: "po-5",
    poNumber: "PO-2026-005",
    vendor: VENDORS[4],
    orderDate: "2026-03-10",
    expectedDelivery: "2026-03-13",
    items: [
      { id: "li-13", name: "Cumin (kg)", quantity: 5, unitPrice: 12.0, total: 60 },
      { id: "li-14", name: "Paprika (kg)", quantity: 3, unitPrice: 14.0, total: 42 },
    ],
    totalAmount: 102,
    status: "cancelled",
    timeline: [
      { date: "2026-03-10", status: "draft", note: "Order drafted" },
      { date: "2026-03-10", status: "ordered", note: "Submitted to vendor" },
      { date: "2026-03-11", status: "cancelled", note: "Vendor unable to fulfill" },
    ],
  },
  {
    id: "po-6",
    poNumber: "PO-2026-006",
    vendor: VENDORS[0],
    orderDate: "2026-03-21",
    expectedDelivery: "2026-03-24",
    items: [
      { id: "li-15", name: "Carrots (kg)", quantity: 40, unitPrice: 2.5, total: 100 },
      { id: "li-16", name: "Potatoes (kg)", quantity: 60, unitPrice: 1.8, total: 108 },
      { id: "li-17", name: "Bell Peppers (kg)", quantity: 20, unitPrice: 5.0, total: 100 },
    ],
    totalAmount: 308,
    status: "draft",
    timeline: [
      { date: "2026-03-21", status: "draft", note: "Order drafted" },
    ],
  },
];
