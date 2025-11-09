'use client';

import { jsPDF } from 'jspdf';
import { Order } from '@/lib/db/schema';

interface PrintEnvelopesButtonProps {
  orders: Order[];
  single?: boolean;
}

export function PrintEnvelopesButton({ orders, single = false }: PrintEnvelopesButtonProps) {
  const handlePrint = async () => {
    const doc = new jsPDF({
      format: [6.5, 4.75], // 6.5" x 4.75" envelope size
      unit: 'in',
      orientation: 'landscape'
    });

    const envelopeWidth = 6.5;
    const envelopeHeight = 4.75;

    orders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // RECIPIENT ADDRESS (centered on envelope)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const recipientStartX = 2.5; // Center position
      let recipientY = 1.9; // Vertically centered
      
      doc.text(
        `${order.recipientFirstName} ${order.recipientLastName}`,
        recipientStartX,
        recipientY
      );
      
      recipientY += 0.2;
      doc.text(
        order.recipientStreet,
        recipientStartX,
        recipientY
      );
      
      if (order.recipientApartment) {
        recipientY += 0.2;
        doc.text(
          order.recipientApartment,
          recipientStartX,
          recipientY
        );
      }
      
      recipientY += 0.2;
      doc.text(
        `${order.recipientCity}, ${order.recipientState} ${order.recipientZip}`,
        recipientStartX,
        recipientY
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

    // Auto-print
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium transition-colors"
    >
      Print {single ? 'Envelope' : `All Envelopes (${orders.length})`}
    </button>
  );
}

