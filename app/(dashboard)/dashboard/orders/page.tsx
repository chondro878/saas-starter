import { db } from '@/lib/db/drizzle';
import { orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { OrderSection } from './order-section';

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

  // Filter orders by card type
  const subscriptionOrders = userOrders.filter(o => o.cardType === 'subscription');
  const bulkOrders = userOrders.filter(o => o.cardType === 'bulk');
  const individualOrders = userOrders.filter(o => o.cardType === 'individual');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Order History</h1>
        <p className="text-gray-600">Track all your greeting card orders</p>
      </div>

      {/* Subscription Orders */}
      <OrderSection
        title="Subscription Cards"
        orders={subscriptionOrders}
        emptyMessage="No subscription orders yet"
        ctaText="Add a Recipient"
        ctaLink="/dashboard/general"
        badgeColor="bg-green-100 text-green-800"
        defaultOpen={true}
      />

      {/* Bulk Pack Orders */}
      <OrderSection
        title="Bulk Pack Cards"
        orders={bulkOrders}
        emptyMessage="No bulk pack orders yet"
        ctaText="Buy Bulk Packs"
        ctaLink="/dashboard/holiday-packs"
        badgeColor="bg-purple-100 text-purple-800"
        defaultOpen={false}
      />

      {/* Individual Orders */}
      <OrderSection
        title="Individual Cards"
        orders={individualOrders}
        emptyMessage="No individual card orders yet"
        ctaText="Buy Individual Cards"
        ctaLink="/dashboard/holiday-packs"
        badgeColor="bg-orange-100 text-orange-800"
        defaultOpen={false}
      />
    </div>
  );
}

