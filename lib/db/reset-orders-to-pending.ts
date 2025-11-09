import { db } from './drizzle';
import { orders, users } from './schema';
import { eq, and } from 'drizzle-orm';

async function resetOrders() {
  console.log('🔄 Resetting orders to pending status...\n');

  // Find the user
  const [user] = await db.select().from(users).where(eq(users.email, 'omgitsjulian@gmail.com'));
  
  if (!user) {
    console.error('❌ User not found!');
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`);

  // Get their orders
  const userOrders = await db.select().from(orders).where(eq(orders.userId, user.id));
  
  console.log(`📦 Found ${userOrders.length} orders for this user`);
  console.log('Current status:');
  userOrders.forEach(o => {
    console.log(`   - Order #${o.id}: ${o.status} (${o.recipientFirstName} ${o.recipientLastName})`);
  });

  // Reset 3 orders to pending status
  const ordersToReset = userOrders.slice(0, 3);
  
  console.log(`\n🔄 Resetting ${ordersToReset.length} orders to "pending" status...`);
  
  for (const order of ordersToReset) {
    await db.update(orders)
      .set({ 
        status: 'pending',
        printDate: null,
        mailDate: null,
      })
      .where(eq(orders.id, order.id));
    
    console.log(`   ✓ Order #${order.id} (${order.recipientFirstName} ${order.recipientLastName}) → pending`);
  }

  console.log('\n🎉 Done! Orders are now ready to print.');
  console.log('\n📋 Next steps:');
  console.log('   1. Refresh /dashboard/fulfillment');
  console.log('   2. You should see 3 pending orders');
}

resetOrders()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  });

