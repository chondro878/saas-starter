import { db } from '@/lib/db/drizzle';
import { orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function OrderHistoryPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  let userOrders: any[] = [];

  try {
    // Get all orders for this user
    userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Continue with empty array
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Order History</h1>
        <p className="text-gray-600">Track all your greeting card orders</p>
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
      label: 'Sent' 
    },
    printed: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      label: 'Printed' 
    },
    pending: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      label: 'Pending' 
    },
    cancelled: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      label: 'Cancelled' 
    },
  }[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800', 
    label: status 
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
      {statusConfig.label}
    </span>
  );
}

