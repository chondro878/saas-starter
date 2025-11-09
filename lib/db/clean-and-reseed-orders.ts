import { db } from './drizzle';
import { orders, users, occasions, recipients, userAddresses, teamMembers, teams } from './schema';
import { eq } from 'drizzle-orm';

async function cleanAndReseed() {
  console.log('🧹 Cleaning up old orders and creating fresh ones...\n');

  // Find the user
  const [user] = await db.select().from(users).where(eq(users.email, 'omgitsjulian@gmail.com'));
  
  if (!user) {
    console.error('❌ User not found!');
    process.exit(1);
  }

  console.log(`✅ User: ${user.email} (ID: ${user.id})\n`);

  // Delete all existing orders for this user
  const deleted = await db.delete(orders).where(eq(orders.userId, user.id));
  console.log(`🗑️  Deleted old orders for this user\n`);

  // Get user's team
  const [teamMember] = await db.select().from(teamMembers).where(eq(teamMembers.userId, user.id));
  const [team] = await db.select().from(teams).where(eq(teams.id, teamMember.teamId));

  // Get return address
  const addresses = await db.select().from(userAddresses).where(eq(userAddresses.userId, user.id));
  const returnAddress = addresses.find(a => a.isDefault === 1) || addresses[0];

  if (!returnAddress) {
    console.error('❌ No return address found!');
    process.exit(1);
  }

  // Get recipients and their occasions
  const userRecipients = await db.select()
    .from(recipients)
    .where(eq(recipients.userId, user.id))
    .orderBy(recipients.id);

  console.log(`👥 Found ${userRecipients.length} recipients\n`);

  // Get occasions
  const allOccasions = await db.select().from(occasions);

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email?.split('@')[0] || 'User';

  // Calculate date for testing (15 days from now)
  const get15DaysFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  };

  console.log('📦 Creating fresh orders...\n');

  // Create 3 pending orders (one for each card type)
  const recipientsToUse = userRecipients.slice(0, 3);

  for (let i = 0; i < recipientsToUse.length; i++) {
    const recipient = recipientsToUse[i];
    const occasion = allOccasions.find(o => o.recipientId === recipient.id);
    
    if (!occasion) {
      console.log(`⚠️  No occasion found for ${recipient.firstName} ${recipient.lastName}, skipping...`);
      continue;
    }

    const cardType = i === 0 ? 'subscription' : i === 1 ? 'bulk' : 'individual';

    const [newOrder] = await db.insert(orders).values({
      recipientId: recipient.id,
      occasionId: occasion.id,
      userId: user.id,
      teamId: team.id,
      cardType: cardType,
      occasionDate: get15DaysFromNow(),
      status: 'pending',
      recipientFirstName: recipient.firstName,
      recipientLastName: recipient.lastName,
      recipientStreet: recipient.street,
      recipientApartment: recipient.apartment,
      recipientCity: recipient.city,
      recipientState: recipient.state,
      recipientZip: recipient.zip,
      returnName: userName,
      returnStreet: returnAddress.street,
      returnApartment: returnAddress.apartment,
      returnCity: returnAddress.city,
      returnState: returnAddress.state,
      returnZip: returnAddress.zip,
      occasionType: occasion.occasionType,
      occasionNotes: occasion.notes,
    }).returning();

    console.log(`   ✓ Created order #${newOrder.id}: ${recipient.firstName} ${recipient.lastName} - ${occasion.occasionType} (${cardType})`);
  }

  console.log('\n🎉 Done! Fresh orders created.');
  console.log('\n📋 Next steps:');
  console.log('   1. Refresh /dashboard/fulfillment');
  console.log('   2. You should see 3 pending orders with correct data');
}

cleanAndReseed()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n👋 Exiting...');
    process.exit(0);
  });

