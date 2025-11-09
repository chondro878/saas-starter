import { db } from './drizzle';
import { orders, users } from './schema';
import { eq, and } from 'drizzle-orm';

async function checkPendingOrders() {
  console.log('🔍 Checking pending orders...\n');

  // Find the user
  const [user] = await db.select().from(users).where(eq(users.email, 'omgitsjulian@gmail.com'));
  
  if (!user) {
    console.error('❌ User not found!');
    process.exit(1);
  }

  // Get their pending orders
  const pendingOrders = await db.select()
    .from(orders)
    .where(and(
      eq(orders.userId, user.id),
      eq(orders.status, 'pending')
    ))
    .orderBy(orders.occasionDate);
  
  console.log(`📦 Found ${pendingOrders.length} pending orders:\n`);

  pendingOrders.forEach((order, i) => {
    console.log(`Order ${i + 1}:`);
    console.log(`  Recipient: ${order.recipientFirstName} ${order.recipientLastName}`);
    console.log(`  Occasion Type: ${order.occasionType}`);
    console.log(`  Occasion Date: ${order.occasionDate}`);
    console.log(`  Occasion Notes: ${order.occasionNotes || 'None'}`);
    console.log(`  Card Type: ${order.cardType}`);
    console.log(`  Status: ${order.status}`);
    console.log('');
  });
}

checkPendingOrders()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

