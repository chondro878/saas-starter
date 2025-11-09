import { db } from './drizzle';
import { orders, users, recipients } from './schema';
import { eq } from 'drizzle-orm';

async function checkOrders() {
  console.log('🔍 Checking orders in database...\n');

  // Get all users
  const allUsers = await db.select({
    id: users.id,
    email: users.email,
  }).from(users);

  console.log('📧 Users in database:');
  allUsers.forEach(u => console.log(`   - ${u.email} (ID: ${u.id})`));
  console.log('');

  // Get all orders
  const allOrders = await db.select().from(orders);
  
  console.log(`📦 Total orders in database: ${allOrders.length}\n`);

  if (allOrders.length === 0) {
    console.log('❌ No orders found in database!');
    console.log('\n💡 Run: npx tsx lib/db/seed-fulfillment-existing.ts');
    return;
  }

  // Group by user
  const ordersByUser = allOrders.reduce((acc, order) => {
    if (!acc[order.userId]) {
      acc[order.userId] = [];
    }
    acc[order.userId].push(order);
    return acc;
  }, {} as Record<number, typeof allOrders>);

  console.log('Orders by user:');
  for (const [userId, userOrders] of Object.entries(ordersByUser)) {
    const user = allUsers.find(u => u.id === parseInt(userId));
    console.log(`\n👤 ${user?.email || 'Unknown'} (${userOrders.length} orders):`);
    
    const byStatus = userOrders.reduce((acc, o) => {
      if (!acc[o.status]) acc[o.status] = 0;
      acc[o.status]++;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('   Status breakdown:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });
  }

  // Get all recipients
  const allRecipients = await db.select().from(recipients);
  console.log(`\n👥 Total recipients: ${allRecipients.length}`);

  const recipientsByUser = allRecipients.reduce((acc, r) => {
    if (!acc[r.userId]) acc[r.userId] = 0;
    acc[r.userId]++;
    return acc;
  }, {} as Record<number, number>);

  console.log('\nRecipients by user:');
  for (const [userId, count] of Object.entries(recipientsByUser)) {
    const user = allUsers.find(u => u.id === parseInt(userId));
    console.log(`   - ${user?.email || 'Unknown'}: ${count} recipients`);
  }
}

checkOrders()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  });

