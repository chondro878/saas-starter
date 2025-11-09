'use client';

import { jsPDF } from 'jspdf';
import type { Order } from '@/lib/db/schema';

// Sample test data
const getSampleOrders = (): Order[] => {
  const today = new Date();
  const occasionDate = new Date(today);
  occasionDate.setDate(occasionDate.getDate() + 15);

  return [
    {
      id: 999,
      recipientId: null,
      occasionId: null,
      userId: 0,
      teamId: 0,
      cardType: 'subscription',
      occasionDate: occasionDate,
      printDate: null,
      mailDate: null,
      status: 'pending',
      recipientFirstName: 'John',
      recipientLastName: 'Smith',
      recipientStreet: '123 Main Street',
      recipientApartment: 'Apt 4B',
      recipientCity: 'Austin',
      recipientState: 'TX',
      recipientZip: '78701',
      returnName: 'Your Business Name',
      returnStreet: '456 Oak Avenue',
      returnApartment: 'Suite 200',
      returnCity: 'Dallas',
      returnState: 'TX',
      returnZip: '75201',
      occasionType: 'Birthday',
      occasionNotes: 'Test card - loves hiking and coffee',
      createdAt: today,
      updatedAt: today,
    },
  ];
};

export function TestPrintButtons() {
  const sampleOrders = getSampleOrders();

  const handleTestLabels = () => {
    const doc = new jsPDF({
      format: 'letter',
      unit: 'in'
    });

    // Avery 5160: 1" x 2.625" labels
    const labelWidth = 2.625;
    const labelHeight = 1;
    const leftMargin = 0.1563;
    const topMargin = 0.5;
    const horizontalGap = 0.125;

    let labelIndex = 0;

    sampleOrders.forEach(order => {
      // RECIPIENT LABEL
      const col = labelIndex % 3;
      const row = Math.floor((labelIndex % 30) / 3);
      const x = leftMargin + (col * (labelWidth + horizontalGap));
      const y = topMargin + (row * labelHeight);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      let currentY = y + 0.25;
      doc.text(`${order.recipientFirstName} ${order.recipientLastName}`, x + 0.1, currentY);
      
      currentY += 0.18;
      doc.text(order.recipientStreet, x + 0.1, currentY);
      
      if (order.recipientApartment) {
        currentY += 0.18;
        doc.text(order.recipientApartment, x + 0.1, currentY);
      }
      
      currentY += 0.18;
      doc.text(`${order.recipientCity}, ${order.recipientState} ${order.recipientZip}`, x + 0.1, currentY);

      labelIndex++;

      // RETURN LABEL
      const returnCol = labelIndex % 3;
      const returnRow = Math.floor((labelIndex % 30) / 3);
      const returnX = leftMargin + (returnCol * (labelWidth + horizontalGap));
      const returnY = topMargin + (returnRow * labelHeight);

      doc.setFontSize(10);
      
      let returnCurrentY = returnY + 0.25;
      doc.text(order.returnName, returnX + 0.1, returnCurrentY);
      
      returnCurrentY += 0.18;
      doc.text(order.returnStreet, returnX + 0.1, returnCurrentY);
      
      if (order.returnApartment) {
        returnCurrentY += 0.18;
        doc.text(order.returnApartment, returnX + 0.1, returnCurrentY);
      }
      
      returnCurrentY += 0.18;
      doc.text(`${order.returnCity}, ${order.returnState} ${order.returnZip}`, returnX + 0.1, returnCurrentY);

      labelIndex++;
    });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleTestEnvelopes = () => {
    const doc = new jsPDF({
      format: [6.5, 4.75],
      unit: 'in',
      orientation: 'landscape'
    });

    const envelopeWidth = 6.5;
    const envelopeHeight = 4.75;

    sampleOrders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // RECIPIENT ADDRESS (centered on envelope)
      doc.setFontSize(22);
      doc.setFont('helvetica', 'normal');
      
      const recipientStartX = 2.1;
      let recipientY = 1.9;
      
      doc.text(
        `${order.recipientFirstName} ${order.recipientLastName}`,
        recipientStartX,
        recipientY
      );
      
      recipientY += 0.35;
      doc.text(
        order.recipientStreet,
        recipientStartX,
        recipientY
      );
      
      if (order.recipientApartment) {
        recipientY += 0.35;
        doc.text(
          order.recipientApartment,
          recipientStartX,
          recipientY
        );
      }
      
      recipientY += 0.35;
      doc.text(
        `${order.recipientCity}, ${order.recipientState} ${order.recipientZip}`,
        recipientStartX,
        recipientY
      );
    });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleTestCards = () => {
    const doc = new jsPDF({
      format: [5, 3],
      unit: 'in',
      orientation: 'landscape'
    });

    const cardWidth = 5;
    const cardHeight = 3;

    sampleOrders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Card content
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('REMINDER CARD', cardWidth / 2, 0.5, { align: 'center' });

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
      doc.text(order.occasionType, cardWidth / 2, 1.4, { align: 'center' });

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
        doc.text(lines, 0.25, 2.2);
      }

      // Card type indicator
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const cardTypeLabel = order.cardType === 'bulk' ? 'Bulk Pack' : 
                           order.cardType === 'individual' ? 'Individual' : 
                           'Subscription';
      doc.text(cardTypeLabel, cardWidth - 0.2, cardHeight - 0.15, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <>
      <button
        onClick={handleTestEnvelopes}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
      >
        Test Print Envelope (1 envelope - 6.5×4.75")
      </button>
      <button
        onClick={handleTestCards}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
      >
        Test Print Card (1 card - 3×5")
      </button>
      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
          Backup: Test Avery Labels
        </summary>
        <button
          onClick={handleTestLabels}
          className="mt-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Test Print Labels (1 order - Avery 5160)
        </button>
      </details>
      <p className="text-xs text-gray-500 mt-4">
        These test buttons use sample data and will not mark any real orders as printed.
      </p>
    </>
  );
}

