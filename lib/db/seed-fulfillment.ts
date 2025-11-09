import { db } from './drizzle';
import { recipients, occasions, userAddresses, orders, teams, users, teamMembers } from './schema';
import { eq } from 'drizzle-orm';

async function seedFulfillment() {
  console.log('🌱 Starting fulfillment seed...');

  // Get the test user (assumes seed.ts has been run first)
  const [user] = await db.select().from(users).where(eq(users.email, 'test@test.com'));
  
  if (!user) {
    console.error('❌ Test user not found. Run npm run db:seed first!');
    process.exit(1);
  }

  // Get the team
  const [teamMember] = await db.select().from(teamMembers).where(eq(teamMembers.userId, user.id));
  const [team] = await db.select().from(teams).where(eq(teams.id, teamMember.teamId));

  // Update team to have an active subscription
  await db.update(teams)
    .set({
      planName: 'Stress Free',
      subscriptionStatus: 'active',
    })
    .where(eq(teams.id, team.id));

  console.log('✅ Updated team subscription status');

  // Add user's return address (default)
  const [returnAddress] = await db.insert(userAddresses).values({
    userId: user.id,
    isDefault: 1,
    street: '456 Oak Avenue',
    apartment: 'Suite 200',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    country: 'United States',
  }).returning();

  console.log('✅ Created return address');

  // Create recipients with occasions
  const recipientData = [
    {
      firstName: 'Emma',
      lastName: 'Johnson',
      relationship: 'Family',
      street: '123 Main Street',
      apartment: 'Apt 4B',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      occasionType: 'Birthday',
      occasionNotes: 'Loves flowers and chocolate',
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      relationship: 'Friend',
      street: '789 Elm Drive',
      apartment: '',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      occasionType: 'Birthday',
      occasionNotes: 'Big sports fan',
    },
    {
      firstName: 'Sarah',
      lastName: 'Williams',
      relationship: 'Romantic',
      street: '321 Pine Lane',
      apartment: 'Unit 12',
      city: 'San Antonio',
      state: 'TX',
      zip: '78201',
      occasionType: 'Anniversary',
      occasionNotes: 'First date anniversary',
    },
    {
      firstName: 'David',
      lastName: 'Martinez',
      relationship: 'Professional',
      street: '555 Cedar Court',
      apartment: '',
      city: 'Fort Worth',
      state: 'TX',
      zip: '76101',
      occasionType: 'Birthday',
      occasionNotes: 'Important client',
    },
    {
      firstName: 'Lisa',
      lastName: 'Anderson',
      relationship: 'Family',
      street: '888 Maple Boulevard',
      apartment: 'Apt 301',
      city: 'Arlington',
      state: 'TX',
      zip: '76001',
      occasionType: 'Birthday',
      occasionNotes: 'Loves cats and coffee',
    },
  ];

  // Calculate dates for testing
  const today = new Date();
  const get15DaysFromNow = () => {
    const date = new Date(today);
    date.setDate(date.getDate() + 15);
    return date;
  };

  const get30DaysFromNow = () => {
    const date = new Date(today);
    date.setDate(date.getDate() + 30);
    return date;
  };

  const get5DaysAgo = () => {
    const date = new Date(today);
    date.setDate(date.getDate() - 5);
    return date;
  };

  console.log('📝 Creating recipients and occasions...');

  for (const data of recipientData) {
    // Create recipient
    const [recipient] = await db.insert(recipients).values({
      userId: user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      relationship: data.relationship,
      street: data.street,
      apartment: data.apartment || null,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: 'United States',
      notes: `${data.relationship} member`,
    }).returning();

    // Create occasion (set for 15 days from now for testing)
    const [occasion] = await db.insert(occasions).values({
      recipientId: recipient.id,
      occasionType: data.occasionType,
      occasionDate: get15DaysFromNow(),
      notes: data.occasionNotes,
    }).returning();

    console.log(`   ✓ Created ${recipient.firstName} ${recipient.lastName} with ${data.occasionType}`);
  }

  console.log('✅ Created 5 recipients with occasions');

  // Now create some mock orders in different states
  console.log('📦 Creating mock orders...');

  const allRecipients = await db.select().from(recipients).where(eq(recipients.userId, user.id));
  
  if (allRecipients.length < 3) {
    console.error('❌ Not enough recipients created');
    process.exit(1);
  }

  // Get occasions for each recipient
  const allOccasions = await db.select().from(occasions);

  // Order 1: PENDING - Subscription card (ready to print today)
  await db.insert(orders).values({
    recipientId: allRecipients[0].id,
    occasionId: allOccasions[0].id,
    userId: user.id,
    teamId: team.id,
    cardType: 'subscription',
    occasionDate: get15DaysFromNow(),
    status: 'pending',
    recipientFirstName: allRecipients[0].firstName,
    recipientLastName: allRecipients[0].lastName,
    recipientStreet: allRecipients[0].street,
    recipientApartment: allRecipients[0].apartment,
    recipientCity: allRecipients[0].city,
    recipientState: allRecipients[0].state,
    recipientZip: allRecipients[0].zip,
    returnName: `${user.firstName || 'Test'} ${user.lastName || 'User'}`,
    returnStreet: returnAddress.street,
    returnApartment: returnAddress.apartment,
    returnCity: returnAddress.city,
    returnState: returnAddress.state,
    returnZip: returnAddress.zip,
    occasionType: allOccasions[0].occasionType,
    occasionNotes: allOccasions[0].notes,
  });

  // Order 2: PENDING - Bulk pack card
  await db.insert(orders).values({
    recipientId: allRecipients[1].id,
    occasionId: allOccasions[1].id,
    userId: user.id,
    teamId: team.id,
    cardType: 'bulk',
    occasionDate: get15DaysFromNow(),
    status: 'pending',
    recipientFirstName: allRecipients[1].firstName,
    recipientLastName: allRecipients[1].lastName,
    recipientStreet: allRecipients[1].street,
    recipientApartment: allRecipients[1].apartment,
    recipientCity: allRecipients[1].city,
    recipientState: allRecipients[1].state,
    recipientZip: allRecipients[1].zip,
    returnName: `${user.firstName || 'Test'} ${user.lastName || 'User'}`,
    returnStreet: returnAddress.street,
    returnApartment: returnAddress.apartment,
    returnCity: returnAddress.city,
    returnState: returnAddress.state,
    returnZip: returnAddress.zip,
    occasionType: allOccasions[1].occasionType,
    occasionNotes: allOccasions[1].notes,
  });

  // Order 3: PENDING - Individual card
  await db.insert(orders).values({
    recipientId: allRecipients[2].id,
    occasionId: allOccasions[2].id,
    userId: user.id,
    teamId: team.id,
    cardType: 'individual',
    occasionDate: get15DaysFromNow(),
    status: 'pending',
    recipientFirstName: allRecipients[2].firstName,
    recipientLastName: allRecipients[2].lastName,
    recipientStreet: allRecipients[2].street,
    recipientApartment: allRecipients[2].apartment,
    recipientCity: allRecipients[2].city,
    recipientState: allRecipients[2].state,
    recipientZip: allRecipients[2].zip,
    returnName: `${user.firstName || 'Test'} ${user.lastName || 'User'}`,
    returnStreet: returnAddress.street,
    returnApartment: returnAddress.apartment,
    returnCity: returnAddress.city,
    returnState: returnAddress.state,
    returnZip: returnAddress.zip,
    occasionType: allOccasions[2].occasionType,
    occasionNotes: allOccasions[2].notes,
  });

  // Order 4: PRINTED (you printed but haven't mailed yet)
  if (allRecipients[3]) {
    await db.insert(orders).values({
      recipientId: allRecipients[3].id,
      occasionId: allOccasions[3].id,
      userId: user.id,
      teamId: team.id,
      cardType: 'subscription',
      occasionDate: get30DaysFromNow(),
      printDate: new Date(),
      status: 'printed',
      recipientFirstName: allRecipients[3].firstName,
      recipientLastName: allRecipients[3].lastName,
      recipientStreet: allRecipients[3].street,
      recipientApartment: allRecipients[3].apartment,
      recipientCity: allRecipients[3].city,
      recipientState: allRecipients[3].state,
      recipientZip: allRecipients[3].zip,
      returnName: `${user.firstName || 'Test'} ${user.lastName || 'User'}`,
      returnStreet: returnAddress.street,
      returnApartment: returnAddress.apartment,
      returnCity: returnAddress.city,
      returnState: returnAddress.state,
      returnZip: returnAddress.zip,
      occasionType: allOccasions[3].occasionType,
      occasionNotes: allOccasions[3].notes,
    });
  }

  // Order 5: MAILED (completed)
  if (allRecipients[4]) {
    await db.insert(orders).values({
      recipientId: allRecipients[4].id,
      occasionId: allOccasions[4].id,
      userId: user.id,
      teamId: team.id,
      cardType: 'subscription',
      occasionDate: get5DaysAgo(),
      printDate: get5DaysAgo(),
      mailDate: get5DaysAgo(),
      status: 'mailed',
      recipientFirstName: allRecipients[4].firstName,
      recipientLastName: allRecipients[4].lastName,
      recipientStreet: allRecipients[4].street,
      recipientApartment: allRecipients[4].apartment,
      recipientCity: allRecipients[4].city,
      recipientState: allRecipients[4].state,
      recipientZip: allRecipients[4].zip,
      returnName: `${user.firstName || 'Test'} ${user.lastName || 'User'}`,
      returnStreet: returnAddress.street,
      returnApartment: returnAddress.apartment,
      returnCity: returnAddress.city,
      returnState: returnAddress.state,
      returnZip: returnAddress.zip,
      occasionType: allOccasions[4].occasionType,
      occasionNotes: allOccasions[4].notes,
    });
  }

  console.log('✅ Created 5 mock orders:');
  console.log('   - 3 PENDING orders (1 subscription, 1 bulk, 1 individual)');
  console.log('   - 1 PRINTED order (ready to mail)');
  console.log('   - 1 MAILED order (completed)');

  console.log('\n🎉 Fulfillment seed complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Login with: test@test.com / admin123');
  console.log('   2. Visit: /dashboard/fulfillment');
  console.log('   3. Test printing labels and cards!');
}

seedFulfillment()
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n👋 Seed process finished. Exiting...');
    process.exit(0);
  });

