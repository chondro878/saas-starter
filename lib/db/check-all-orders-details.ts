import { db } from './drizzle';
import { orders } from './schema';

async function checkAllOrdersDetails() {
  console.log('🔍 Checking all orders with full details...\n');

  const allOrders = await db.select()
    .from(orders)
    .orderBy(orders.userId, orders.id);
  
  console.log(`📦 Found ${allOrders.length} total orders:\n`);

  allOrders.forEach((order) => {
    console.log(`Order ID: ${order.id} (User ID: ${order.userId})`);
    console.log(`  Recipient: ${order.recipientFirstName} ${order.recipientLastName}`);
    console.log(`  Occasion Type: ${order.occasionType}`);
    console.log(`  Occasion Date: ${new Date(order.occasionDate).toLocaleDateString()}`);
    console.log(`  Occasion Notes: ${order.occasionNotes || 'None'}`);
    console.log(`  Card Type: ${order.cardType}`);
    console.log(`  Status: ${order.status}`);
    console.log('');
  });
}

checkAllOrdersDetails()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

