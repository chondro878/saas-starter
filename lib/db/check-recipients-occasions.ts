import { db } from './drizzle';
import { recipients, occasions, users } from './schema';
import { eq } from 'drizzle-orm';

async function checkRecipientsOccasions() {
  console.log('🔍 Checking recipients and their occasions...\n');

  // Find the user
  const [user] = await db.select().from(users).where(eq(users.email, 'omgitsjulian@gmail.com'));
  
  if (!user) {
    console.error('❌ User not found!');
    process.exit(1);
  }

  console.log(`✅ User: ${user.email} (ID: ${user.id})\n`);

  // Get their recipients
  const userRecipients = await db.select()
    .from(recipients)
    .where(eq(recipients.userId, user.id))
    .orderBy(recipients.firstName);
  
  console.log(`👥 Found ${userRecipients.length} recipients:\n`);

  for (const recipient of userRecipients) {
    console.log(`${recipient.firstName} ${recipient.lastName}:`);
    console.log(`  ID: ${recipient.id}`);
    console.log(`  Relationship: ${recipient.relationship}`);
    
    // Get occasions for this recipient
    const recipientOccasions = await db.select()
      .from(occasions)
      .where(eq(occasions.recipientId, recipient.id));
    
    console.log(`  Occasions (${recipientOccasions.length}):`);
    recipientOccasions.forEach(occ => {
      console.log(`    - ${occ.occasionType}: ${new Date(occ.occasionDate).toLocaleDateString()}`);
      if (occ.notes) {
        console.log(`      Notes: ${occ.notes}`);
      }
    });
    console.log('');
  }
}

checkRecipientsOccasions()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

