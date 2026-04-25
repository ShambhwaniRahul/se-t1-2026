import { jsPDF } from "jspdf";
import type { CustomerInfo } from "./data/types";
import type { GroupedItem } from "@/config/types/order";

interface ReceiptData {
  items: GroupedItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  loyaltyPointsApplied: number;
  loyaltyValue: number;
  finalTotal: number;
  pointsEarned: number;
  customer: CustomerInfo | null;
}

export function generateReceiptPdf(data: ReceiptData) {
  const width = 80;
  const lineH = 4;
  const baseHeight = 95;
  const itemsHeight = data.items.length * lineH;
  const height = baseHeight + itemsHeight + (data.customer ? 12 : 0);

  const doc = new jsPDF({ unit: "mm", format: [width, height] });
  const margin = 4;
  const contentW = width - margin * 2;
  let y = 6;

  const text = (
    str: string,
    opts: { align?: "left" | "center" | "right"; bold?: boolean; size?: number } = {}
  ) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size ?? 8);
    const x =
      opts.align === "center"
        ? width / 2
        : opts.align === "right"
          ? width - margin
          : margin;
    doc.text(str, x, y, { align: opts.align ?? "left" });
  };

  const row = (left: string, right: string, bold = false) => {
    const rightColWidth = 20; // mm reserved for price
    const leftColWidth = contentW - rightColWidth;

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(8);

    // 🔹 Trim left text to fit available width
    const trimmedLeft = doc.splitTextToSize(left, leftColWidth)[0] || left;

    // 🔹 Left text
    doc.text(trimmedLeft, margin, y);

    // 🔹 Right text aligned to the right margin with negative charSpace to compress the numbers
    doc.text(right, width - margin, y, { align: "right", charSpace: -0.3 });
  };

  const hr = () => {
    doc.setLineDashPattern([0.5, 0.5], 0);
    doc.setDrawColor(120);
    doc.line(margin, y, width - margin, y);
    doc.setLineDashPattern([], 0);
  };

  // Header
  text("COHERENCE", { align: "center", bold: true, size: 12 });
  y += 4;
  text("Restaurant Receipt", { align: "center", size: 7 });
  y += 3;
  text(new Date().toLocaleString(), { align: "center", size: 7 });
  y += 4;
  hr();
  y += 4;

  // Customer
  if (data.customer) {
    text(`Customer: ${data.customer.first_name} ${data.customer.last_name}`, { size: 7 });
    y += 3;
    text(`Phone: ${data.customer.phone_no}`, { size: 7 });
    y += 4;
    hr();
    y += 4;
  }

  // Items
  text("ITEMS", { bold: true, size: 8 });
  y += 4;

  data.items.forEach((item) => {
    const name =
      item.name.length > 22 ? item.name.slice(0, 22) + "…" : item.name;

    const qty = item.items.length;
    const qtyName = `${qty}× ${name}`;
    const lineTotal = `Rs. ${(item.price * qty).toFixed(2)}`;

    row(qtyName, lineTotal);
    y += lineH;
  });

  y += 1;
  hr();
  y += 4;

  // Totals
  row("Subtotal", `Rs. ${data.subtotal.toFixed(2)}`);
  y += 4;

  if (data.loyaltyPointsApplied > 0) {
    row(
      `Loyalty (${data.loyaltyPointsApplied} pts)`,
      `- ${data.loyaltyValue.toFixed(2)}`
    );
    y += 4;
  }

  if (data.discountPercent > 0) {
    row(
      `Discount (${data.discountPercent}%)`,
      `- ${data.discountAmount.toFixed(2)}`
    );
    y += 4;
  }

  hr();
  y += 4;
  row("TOTAL", `Rs. ${data.finalTotal.toFixed(2)}`, true);
  y += 5;

  if (data.customer && data.pointsEarned > 0) {
    text(`+ ${data.pointsEarned} loyalty pts earned`, { align: "center", size: 7 });
    y += 4;
  }

  hr();
  y += 4;
  text("Thank you for dining with us!", { align: "center", size: 7 });

  doc.save(`receipt-${Date.now()}.pdf`);
}
