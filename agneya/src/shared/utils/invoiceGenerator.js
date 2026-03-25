import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates a professional PDF invoice for an order.
 * @param {Object} order - The order data object.
 * @param {boolean} isCustom - Whether it's a custom order.
 */
export const generateInvoice = (order, isCustom = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header Section ---
  doc.setFontSize(22);
  doc.setTextColor(156, 81, 182); // Agneya Grape Color
  doc.text("AGNEYA", 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Premium Apparel & Custom Designs", 20, 32);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("INVOICE", pageWidth - 20, 25, { align: "right" });
  
  doc.setFontSize(10);
  doc.text(`Invoice #: AG-${order._id?.slice(-8).toUpperCase()}`, pageWidth - 20, 32, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 38, { align: "right" });

  // --- Horizontal Line ---
  doc.setDrawColor(200);
  doc.line(20, 45, pageWidth - 20, 45);

  // --- Customer Info ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Bill To:", 20, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(order.userId?.fullName || order.userId?.name || "Valued Customer", 20, 62);
  doc.text(order.userId?.email || "Guest", 20, 68);
  if (order.shippingAddress) {
    doc.text(order.shippingAddress, 20, 74, { maxWidth: 80 });
  }

  // --- Order Details Table ---
  const tableColumn = ["Item Description", "Qty", "Unit Price", "Total"];
  const tableRows = [];

  if (isCustom) {
    tableRows.push([
      `Custom Design - ${order.baseProductId?.name || "Base Product"}`,
      "1",
      `₹${(order.totalAmount || 0).toLocaleString()}`,
      `₹${(order.totalAmount || 0).toLocaleString()}`
    ]);
  } else {
    tableRows.push([
      order.productId?.name || "Ready Product",
      "1",
      `₹${(order.amount || 0).toLocaleString()}`,
      `₹${(order.amount || 0).toLocaleString()}`
    ]);
  }

  doc.autoTable({
    startY: 90,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [156, 81, 182] },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    }
  });

  // --- Summary Section ---
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Total Amount: ₹${(isCustom ? order.totalAmount : order.amount).toLocaleString()}`, pageWidth - 20, finalY + 10, { align: "right" });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 150, 0);
  doc.text(`Payment Status: PAID`, pageWidth - 20, finalY + 18, { align: "right" });

  // --- Footer ---
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for choosing Agneya!", pageWidth / 2, pageWidth + 40, { align: "center" });
  doc.text("This is a computer-generated invoice.", pageWidth / 2, pageWidth + 46, { align: "center" });

  // Save the PDF
  doc.save(`Invoice_${order._id?.slice(-8)}.pdf`);
};
