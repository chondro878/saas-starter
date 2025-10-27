import { db } from '@/lib/db/drizzle';
import { orders } from '@/lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function OrderHistoryPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  let userOrders: any[] = [];
  let currentYearOrders: any[] = [];

  try {
    // Get all orders for this user
    userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    // Get current year orders count by card type
    currentYearOrders = await db
      .select({
        cardType: orders.cardType,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.userId, user.id),
          sql`EXTRACT(YEAR FROM ${orders.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`,
          sql`${orders.status} != 'cancelled'`
        )
      )
      .groupBy(orders.cardType);
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Continue with empty arrays
  }

  const ordersByStatus = {
    mailed: userOrders.filter(o => o.status === 'mailed'),
    printed: userOrders.filter(o => o.status === 'printed'),
    pending: userOrders.filter(o => o.status === 'pending'),
    cancelled: userOrders.filter(o => o.status === 'cancelled'),
  };

  const ordersByType = {
    subscription: currentYearOrders.find(o => o.cardType === 'subscription')?.count || 0,
    bulk: currentYearOrders.find(o => o.cardType === 'bulk')?.count || 0,
    individual: currentYearOrders.find(o => o.cardType === 'individual')?.count || 0,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Order History</h1>
        <p className="text-gray-600">Track all your greeting card orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-green-700">📬 Sent</h3>
          <p className="text-3xl font-bold">{ordersByStatus.mailed.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-yellow-700">📦 In Process</h3>
          <p className="text-3xl font-bold">
            {ordersByStatus.printed.length + ordersByStatus.pending.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-blue-700">📊 This Year</h3>
          <p className="text-3xl font-bold">{userOrders.filter(o => {
            const orderYear = new Date(o.createdAt).getFullYear();
            const currentYear = new Date().getFullYear();
            return orderYear === currentYear && o.status !== 'cancelled';
          }).length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2 text-purple-700">🎯 Total</h3>
          <p className="text-3xl font-bold">{userOrders.filter(o => o.status !== 'cancelled').length}</p>
        </div>
      </div>

      {/* Card Usage Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Card Usage This Year</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Subscription Cards</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                Included
              </span>
            </div>
            <p className="text-2xl font-bold">{Number(ordersByType.subscription)}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Bulk Pack Cards</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                $39/pack
              </span>
            </div>
            <p className="text-2xl font-bold">{Number(ordersByType.bulk)}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Individual Cards</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                $9/card
              </span>
            </div>
            <p className="text-2xl font-bold">{Number(ordersByType.individual)}</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Orders</h2>
          {userOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No orders yet</p>
              <p className="text-gray-400">Orders will appear here once you add recipients and occasions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map(order => (
                <div key={order.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {order.recipientFirstName} {order.recipientLastName}
                        </p>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm font-medium text-gray-700">
                          {order.occasionType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Occasion Date: {new Date(order.occasionDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">
                          Ordered: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.mailDate && (
                          <p className="text-xs text-gray-500">
                            Mailed: {new Date(order.mailDate).toLocaleDateString()}
                          </p>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.cardType === 'subscription' ? 'bg-green-100 text-green-800' :
                          order.cardType === 'bulk' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {order.cardType === 'subscription' ? 'Subscription' :
                           order.cardType === 'bulk' ? 'Bulk Pack' :
                           'Individual'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    mailed: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: '✅', 
      label: 'Sent' 
    },
    printed: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: '🖨️', 
      label: 'Printed' 
    },
    pending: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      icon: '⏳', 
      label: 'Pending' 
    },
    cancelled: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      icon: '❌', 
      label: 'Cancelled' 
    },
  }[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800', 
    icon: '❓', 
    label: status 
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
      {statusConfig.icon} {statusConfig.label}
    </span>
  );
}

