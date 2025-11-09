'use client';

import { jsPDF } from 'jspdf';
import { Order } from '@/lib/db/schema';

interface PrintReminderCardsButtonProps {
  orders: Order[];
  single?: boolean;
}

export function PrintReminderCardsButton({ orders, single = false }: PrintReminderCardsButtonProps) {
  const handlePrint = async () => {
    const doc = new jsPDF({
      format: [5, 3], // Custom size: 5" x 3" (landscape orientation for index card)
      unit: 'in',
      orientation: 'landscape'
    });

    // Single 3" x 5" card per page (for printing on index cards)
    const cardWidth = 5;
    const cardHeight = 3;
    const pageWidth = 5;
    const pageHeight = 3;

    // No margin needed - card fills the page
    const x = 0;
    const y = 0;

    orders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const recipientName = `${order.recipientFirstName} ${order.recipientLastName}`;
      const occasionDate = new Date(order.occasionDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      // Header: "{Name}: {Occasion} is on {DATE}"
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${recipientName}: ${order.occasionType} is on ${occasionDate}`,
        cardWidth / 2,
        0.4,
        { align: 'center' }
      );

      // Horizontal line below header
      doc.setLineWidth(0.01);
      doc.line(0.3, 0.55, cardWidth - 0.3, 0.55);

      // Subheading: "~ A little nudge from your past self ~"
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(
        '~ A little nudge from your past self ~',
        cardWidth / 2,
        0.8,
        { align: 'center' }
      );

      // Main reminder text in center (in quotes)
      if (order.occasionNotes) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const reminderText = `" ${order.occasionNotes} "`;
        const lines = doc.splitTextToSize(reminderText, cardWidth - 0.8);
        const textHeight = lines.length * 0.18;
        const startY = (cardHeight - textHeight) / 2;
        
        doc.text(
          lines,
          cardWidth / 2,
          startY,
          { align: 'center' }
        );
      }

      // Footer: "- Avoid the Rain -"
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        '- Avoid the Rain -',
        cardWidth / 2,
        cardHeight - 0.3,
        { align: 'center' }
      );
    });

    // Mark orders as printed
    const orderIds = orders.map(o => o.id);
    if (!single) {
      try {
        await fetch('/api/orders/mark-all-printed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIds }),
        });
      } catch (error) {
        console.error('Failed to mark orders as printed:', error);
      }
    }

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
    >
      Print {single ? 'Card' : `All Cards (${orders.length})`}
    </button>
  );
}

