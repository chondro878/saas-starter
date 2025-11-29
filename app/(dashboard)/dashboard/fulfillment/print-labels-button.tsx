'use client';

import { jsPDF } from 'jspdf';
import { Order } from '@/lib/db/schema';

interface PrintLabelsButtonProps {
  orders: Order[];
  single?: boolean;
}

export function PrintLabelsButton({ orders, single = false }: PrintLabelsButtonProps) {
  const handlePrint = async () => {
    const doc = new jsPDF({
      format: 'letter',
      unit: 'in'
    });

    // Avery 5160: 1" x 2.625" labels, 3 columns, 10 rows per sheet
    const labelWidth = 2.625;
    const labelHeight = 1;
    const leftMargin = 0.1563; // 5/32 inch
    const topMargin = 0.5;
    const horizontalGap = 0.125;
    const verticalGap = 0;

    let labelIndex = 0;

    // Each order needs 2 labels: recipient + return
    orders.forEach(order => {
      // RECIPIENT LABEL
      if (labelIndex > 0 && labelIndex % 30 === 0) {
        doc.addPage();
      }

      const col = labelIndex % 3;
      const row = Math.floor((labelIndex % 30) / 3);
      const x = leftMargin + (col * (labelWidth + horizontalGap));
      const y = topMargin + (row * (labelHeight + verticalGap));

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let currentY = y + 0.25;
      const recipientName = order.recipientLastName
        ? `${order.recipientFirstName} ${order.recipientLastName}`
        : order.recipientFirstName;
      doc.text(
        recipientName,
        x + 0.1,
        currentY
      );
      
      currentY += 0.18;
      doc.text(
        order.recipientStreet,
        x + 0.1,
        currentY
      );
      
      if (order.recipientApartment) {
        currentY += 0.18;
        doc.text(
          order.recipientApartment,
          x + 0.1,
          currentY
        );
      }
      
      currentY += 0.18;
      doc.text(
        `${order.recipientCity}, ${order.recipientState} ${order.recipientZip}`,
        x + 0.1,
        currentY
      );

      labelIndex++;

      // RETURN LABEL
      if (labelIndex > 0 && labelIndex % 30 === 0) {
        doc.addPage();
      }

      const returnCol = labelIndex % 3;
      const returnRow = Math.floor((labelIndex % 30) / 3);
      const returnX = leftMargin + (returnCol * (labelWidth + horizontalGap));
      const returnY = topMargin + (returnRow * (labelHeight + verticalGap));

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let returnCurrentY = returnY + 0.25;
      doc.text(
        order.returnName,
        returnX + 0.1,
        returnCurrentY
      );
      
      returnCurrentY += 0.18;
      doc.text(
        order.returnStreet,
        returnX + 0.1,
        returnCurrentY
      );
      
      if (order.returnApartment) {
        returnCurrentY += 0.18;
        doc.text(
          order.returnApartment,
          returnX + 0.1,
          returnCurrentY
        );
      }
      
      returnCurrentY += 0.18;
      doc.text(
        `${order.returnCity}, ${order.returnState} ${order.returnZip}`,
        returnX + 0.1,
        returnCurrentY
      );

      labelIndex++;
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
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors"
    >
      Print {single ? 'Labels' : `All Labels (${orders.length * 2})`}
    </button>
  );
}

