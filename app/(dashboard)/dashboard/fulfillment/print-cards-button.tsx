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
      orientation: 'portrait'
    });

    // 3" x 5" cards, 2 per page (one on top half, one on bottom half)
    const cardWidth = 5;
    const cardHeight = 3;
    const pageWidth = 8.5;
    const pageHeight = 11;

    // Center cards on page
    const leftMargin = (pageWidth - cardWidth) / 2;
    const topCard1 = 1.5;
    const topCard2 = pageHeight - cardHeight - 1.5;

    orders.forEach((order, index) => {
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
      }

      const isFirstCard = index % 2 === 0;
      const y = isFirstCard ? topCard1 : topCard2;

      // Draw border
      doc.setLineWidth(0.01);
      doc.rect(leftMargin, y, cardWidth, cardHeight);

      // Card content
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'REMINDER CARD',
        leftMargin + cardWidth / 2,
        y + 0.5,
        { align: 'center' }
      );

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${order.recipientFirstName} ${order.recipientLastName}`,
        leftMargin + cardWidth / 2,
        y + 1.0,
        { align: 'center' }
      );

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(
        order.occasionType,
        leftMargin + cardWidth / 2,
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
        leftMargin + cardWidth / 2,
        y + 1.75,
        { align: 'center' }
      );

      if (order.occasionNotes) {
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(order.occasionNotes, cardWidth - 0.5);
        doc.text(
          lines,
          leftMargin + 0.25,
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
        leftMargin + cardWidth - 0.2,
        y + cardHeight - 0.15,
        { align: 'right' }
      );
      doc.setTextColor(0, 0, 0);

      // Dotted cut line
      if (!isFirstCard || index < orders.length - 1) {
        doc.setLineDash([0.05, 0.1]);
        doc.line(0, y + cardHeight, pageWidth, y + cardHeight);
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

