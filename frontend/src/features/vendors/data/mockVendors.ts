import type { Vendor, VendorPurchaseOrder } from "./types";

export const mockVendors: Vendor[] = [
  {
    id: "v1",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh@freshfarms.in",
    contactNo: "+91 98765 43210",
    address: "12, MG Road, Indiranagar, Bangalore 560038",
    gstNumber: "GSTIN2934857610A",
  },
  {
    id: "v2",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya@seafoodking.in",
    contactNo: "+91 87654 32109",
    address: "45, Beach Road, Koramangala, Bangalore 560034",
    gstNumber: "GSTIN8271640395B",
  },
  {
    id: "v3",
    firstName: "Amit",
    lastName: "Patel",
    email: "amit@spiceworld.in",
    contactNo: "+91 76543 21098",
    address: "78, Commercial Street, Jayanagar, Bangalore 560041",
    gstNumber: "GSTIN6493028175C",
  },
  {
    id: "v4",
    firstName: "Deepa",
    lastName: "Nair",
    email: "deepa@dairydelight.in",
    contactNo: "+91 65432 10987",
    address: "23, Dairy Circle, JP Nagar, Bangalore 560078",
    gstNumber: "GSTIN1057382946D",
  },
  {
    id: "v5",
    firstName: "Suresh",
    lastName: "Reddy",
    email: "suresh@packpro.in",
    contactNo: "+91 54321 09876",
    address: "90, Industrial Area, Peenya, Bangalore 560058",
    gstNumber: "GSTIN7384920561E",
  },
];

export const mockVendorPurchaseOrders: VendorPurchaseOrder[] = [
  { id: "vpo1", vendorId: "v1", poId: "PO-1001", date: "2026-04-01", type: "Perishable", status: "Received", deliveryCost: 1200 },
  { id: "vpo2", vendorId: "v1", poId: "PO-1005", date: "2026-04-08", type: "Perishable", status: "Pending", deliveryCost: 850 },
  { id: "vpo3", vendorId: "v2", poId: "PO-1002", date: "2026-04-02", type: "Perishable", status: "Received", deliveryCost: 2400 },
  { id: "vpo4", vendorId: "v2", poId: "PO-1009", date: "2026-04-10", type: "Perishable", status: "Cancelled", deliveryCost: 1800 },
  { id: "vpo5", vendorId: "v3", poId: "PO-1003", date: "2026-04-03", type: "Non-Perishable", status: "Received", deliveryCost: 500 },
  { id: "vpo6", vendorId: "v3", poId: "PO-1007", date: "2026-04-09", type: "Non-Perishable", status: "Pending", deliveryCost: 650 },
  { id: "vpo7", vendorId: "v4", poId: "PO-1004", date: "2026-04-04", type: "Perishable", status: "Received", deliveryCost: 900 },
  { id: "vpo8", vendorId: "v4", poId: "PO-1011", date: "2026-04-12", type: "Perishable", status: "Pending", deliveryCost: 1100 },
  { id: "vpo9", vendorId: "v5", poId: "PO-1006", date: "2026-04-05", type: "Non-Perishable", status: "Received", deliveryCost: 350 },
  { id: "vpo10", vendorId: "v5", poId: "PO-1008", date: "2026-04-07", type: "Non-Perishable", status: "Cancelled", deliveryCost: 420 },
];
