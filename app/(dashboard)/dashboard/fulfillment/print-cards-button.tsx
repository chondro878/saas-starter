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

      // Card content (no border needed - card fills page)
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'REMINDER CARD',
        cardWidth / 2,
        0.5,
        { align: 'center' }
      );

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${order.recipientFirstName} ${order.recipientLastName}`,
        cardWidth / 2,
        1.0,
        { align: 'center' }
      );

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(
        order.occasionType,
        cardWidth / 2,
        1.4,
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
        cardWidth / 2,
        1.75,
        { align: 'center' }
      );

      if (order.occasionNotes) {
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(order.occasionNotes, cardWidth - 0.5);
        doc.text(
          lines,
          0.25,
          2.2
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
        cardWidth - 0.2,
        cardHeight - 0.15,
        { align: 'right' }
      );
      doc.setTextColor(0, 0, 0);
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

