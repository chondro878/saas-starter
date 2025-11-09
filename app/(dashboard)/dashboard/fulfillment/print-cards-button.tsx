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
      format: 'letter',
      unit: 'in',
      orientation: 'landscape'
    });

    // 3" x 5" cards, 2 per page (one on left half, one on right half)
    const cardWidth = 5;
    const cardHeight = 3;
    const pageWidth = 11;  // landscape: 11" wide
    const pageHeight = 8.5; // landscape: 8.5" tall

    // Center cards on page - side by side
    const topMargin = (pageHeight - cardHeight) / 2;
    const leftCard1 = 0.75;
    const leftCard2 = pageWidth - cardWidth - 0.75;

    orders.forEach((order, index) => {
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
      }

      const isFirstCard = index % 2 === 0;
      const x = isFirstCard ? leftCard1 : leftCard2;
      const y = topMargin;

      // Draw border
      doc.setLineWidth(0.01);
      doc.rect(x, y, cardWidth, cardHeight);

      // Card content
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'REMINDER CARD',
        x + cardWidth / 2,
        y + 0.5,
        { align: 'center' }
      );

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${order.recipientFirstName} ${order.recipientLastName}`,
        x + cardWidth / 2,
        y + 1.0,
        { align: 'center' }
      );

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(
        order.occasionType,
        x + cardWidth / 2,
        y + 1.4,
        { align: 'center' }
      );

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(
        new Date(order.occasionDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        x + cardWidth / 2,
        y + 1.75,
        { align: 'center' }
      );

      if (order.occasionNotes) {
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(order.occasionNotes, cardWidth - 0.5);
        doc.text(
          lines,
          x + 0.25,
          y + 2.2
        );
      }

      // Add card type indicator
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const cardTypeLabel = order.cardType === 'bulk' ? 'Bulk Pack' : 
                           order.cardType === 'individual' ? 'Individual' : 
                           'Subscription';
      doc.text(
        cardTypeLabel,
        x + cardWidth - 0.2,
        y + cardHeight - 0.15,
        { align: 'right' }
      );
      doc.setTextColor(0, 0, 0);

      // Dotted cut line (vertical, between cards)
      if (isFirstCard && index < orders.length - 1 && orders.length > 1) {
        doc.setLineDash([0.05, 0.1]);
        doc.line(x + cardWidth, 0, x + cardWidth, pageHeight);
        doc.setLineDash([]);
      }
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

