import { db } from './drizzle';
import { orders } from './schema';
import { eq } from 'drizzle-orm';

async function checkAllPending() {
  console.log('🔍 Checking ALL pending orders...\n');

  const pendingOrders = await db.select()
    .from(orders)
    .where(eq(orders.status, 'pending'))
    .orderBy(orders.userId, orders.occasionDate);
  
  console.log(`📦 Found ${pendingOrders.length} total pending orders:\n`);

  pendingOrders.forEach((order, i) => {
    console.log(`Order ${i + 1} (ID: ${order.id}, User ID: ${order.userId}):`);
    console.log(`  Recipient: ${order.recipientFirstName} ${order.recipientLastName}`);
    console.log(`  Occasion Type: ${order.occasionType}`);
    console.log(`  Occasion Date: ${new Date(order.occasionDate).toLocaleDateString()}`);
    console.log(`  Occasion Notes: ${order.occasionNotes || 'None'}`);
    console.log(`  Card Type: ${order.cardType}`);
    console.log('');
  });
}

checkAllPending()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

