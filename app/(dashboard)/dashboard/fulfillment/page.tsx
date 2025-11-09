import { db } from '@/lib/db/drizzle';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PrintLabelsButton } from './print-labels-button';
import { PrintReminderCardsButton } from './print-cards-button';
import { MarkAsSentButton } from './mark-sent-button';
import type { Order } from '@/lib/db/schema';

export default async function FulfillmentPage() {
  let pendingOrders: Order[] = [];
  let printedOrders: Order[] = [];

  try {
    // Get all pending orders (need to be printed today)
    pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, 'pending'))
      .orderBy(orders.occasionDate);

    // Get printed but not mailed orders
    printedOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, 'printed'))
      .orderBy(orders.printDate);
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Continue with empty arrays
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Group orders by card type
  const pendingByType = {
    subscription: pendingOrders.filter(o => o.cardType === 'subscription'),
    bulk: pendingOrders.filter(o => o.cardType === 'bulk'),
    individual: pendingOrders.filter(o => o.cardType === 'individual'),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Fulfillment</h1>
        <p className="text-gray-600">{today}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pending</h3>
          <p className="text-3xl font-bold text-blue-600">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Subscription</h3>
          <p className="text-3xl font-bold text-green-600">{pendingByType.subscription.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bulk Packs</h3>
          <p className="text-3xl font-bold text-purple-600">{pendingByType.bulk.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Individual</h3>
          <p className="text-3xl font-bold text-orange-600">{pendingByType.individual.length}</p>
        </div>
      </div>

      {/* Pending Orders Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Orders to Print Today</h2>
            <p className="text-gray-600">
              {pendingOrders.length} {pendingOrders.length === 1 ? 'order' : 'orders'} 
              {' '}(Mail these today for 15-day delivery)
            </p>
          </div>
          {pendingOrders.length > 0 && (
            <div className="flex gap-3">
              <PrintLabelsButton orders={pendingOrders} />
              <PrintReminderCardsButton orders={pendingOrders} />
            </div>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No orders to print today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Printed But Not Mailed Section */}
      {printedOrders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Printed - Waiting to Mail ({printedOrders.length})
          </h2>
          <div className="space-y-3">
            {printedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
                <div>
                  <p className="font-medium">
                    {order.recipientFirstName} {order.recipientLastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.occasionType} - {new Date(order.occasionDate).toLocaleDateString()}
                  </p>
                  {order.printDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Printed: {new Date(order.printDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <MarkAsSentButton orderId={order.id} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  // Get card type badge color
  const cardTypeBadge = {
    subscription: { bg: 'bg-green-100', text: 'text-green-800', label: 'Subscription' },
    bulk: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Bulk Pack' },
    individual: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Individual' },
  }[order.cardType] || { bg: 'bg-gray-100', text: 'text-gray-800', label: order.cardType };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">
              {order.recipientFirstName} {order.recipientLastName}
            </h3>
            <span className={`px-2 py-1 ${cardTypeBadge.bg} ${cardTypeBadge.text} text-xs font-medium rounded`}>
              {order.occasionType}
            </span>
            <span className={`px-2 py-1 ${cardTypeBadge.bg} ${cardTypeBadge.text} text-xs font-medium rounded`}>
              {cardTypeBadge.label}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Occasion:</span> {new Date(order.occasionDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <p>
              <span className="font-medium">Address:</span><br />
              {order.recipientStreet}{order.recipientApartment ? `, ${order.recipientApartment}` : ''}<br />
              {order.recipientCity}, {order.recipientState} {order.recipientZip}
            </p>
            {order.occasionNotes && (
              <p>
                <span className="font-medium">Notes:</span> {order.occasionNotes}
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Return Address:</p>
            <p className="text-sm text-gray-600">
              {order.returnName}, {order.returnStreet}
              {order.returnApartment ? `, ${order.returnApartment}` : ''}, {' '}
              {order.returnCity}, {order.returnState} {order.returnZip}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <PrintLabelsButton orders={[order]} single />
          <PrintReminderCardsButton orders={[order]} single />
          <MarkAsSentButton orderId={order.id} compact />
        </div>
      </div>
    </div>
  );
}

