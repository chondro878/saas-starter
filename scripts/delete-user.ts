/**
 * Script to manually delete a user and all related data
 * Usage: npx tsx scripts/delete-user.ts <email>
 */

import { db } from '../lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, recipients, occasions, orders } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/delete-user.ts <email>');
  process.exit(1);
}

async function deleteUser(userEmail: string) {
  console.log(`\n🔍 Looking for user: ${userEmail}`);

  try {
    // Find user in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log(`✓ Found user: ID ${user.id}`);

    // Get user's team memberships
    const userTeamMemberships = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id));

    console.log(`  - Team memberships: ${userTeamMemberships.length}`);

    // Get user's recipients
    const userRecipients = await db
      .select()
      .from(recipients)
      .where(eq(recipients.userId, user.id));

    console.log(`  - Recipients: ${userRecipients.length}`);

    // Delete in proper order to respect foreign keys
    console.log('\n🗑️  Starting deletion process...\n');

    // 1. Delete orders (references recipients and users)
    for (const recipient of userRecipients) {
      const deletedOrders = await db
        .delete(orders)
        .where(eq(orders.recipientId, recipient.id))
        .returning();
      if (deletedOrders.length > 0) {
        console.log(`  ✓ Deleted ${deletedOrders.length} orders for recipient ${recipient.id}`);
      }
    }

    // 2. Delete occasions (references recipients)
    for (const recipient of userRecipients) {
      const deletedOccasions = await db
        .delete(occasions)
        .where(eq(occasions.recipientId, recipient.id))
        .returning();
      if (deletedOccasions.length > 0) {
        console.log(`  ✓ Deleted ${deletedOccasions.length} occasions for recipient ${recipient.id}`);
      }
    }

    // 3. Delete recipients (references users)
    const deletedRecipients = await db
      .delete(recipients)
      .where(eq(recipients.userId, user.id))
      .returning();
    if (deletedRecipients.length > 0) {
      console.log(`  ✓ Deleted ${deletedRecipients.length} recipients`);
    }

    // 4. Delete activity logs (references users and teams)
    const deletedLogs = await db
      .delete(activityLogs)
      .where(eq(activityLogs.userId, user.id))
      .returning();
    if (deletedLogs.length > 0) {
      console.log(`  ✓ Deleted ${deletedLogs.length} activity logs`);
    }

    // 5. Delete team memberships
    const deletedMemberships = await db
      .delete(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .returning();
    if (deletedMemberships.length > 0) {
      console.log(`  ✓ Deleted ${deletedMemberships.length} team memberships`);
    }

    // 6. Check for orphaned teams and delete them
    for (const membership of userTeamMemberships) {
      const remainingMembers = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, membership.teamId))
        .limit(1);

      if (remainingMembers.length === 0) {
        // Team has no more members, delete it
        await db.delete(teams).where(eq(teams.id, membership.teamId));
        console.log(`  ✓ Deleted orphaned team ${membership.teamId}`);
      }
    }

    // 7. Delete user from database
    await db.delete(users).where(eq(users.id, user.id));
    console.log(`  ✓ Deleted user from database`);

    // 8. Delete from Supabase Auth
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Find user in Supabase by email
      const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

      if (listError) {
        console.error('  ⚠️  Error listing Supabase users:', listError.message);
      } else if (authUsers) {
        const supabaseUser = authUsers.users.find(u => u.email === userEmail);
        
        if (supabaseUser) {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(supabaseUser.id);
          
          if (deleteError) {
            console.error('  ⚠️  Error deleting from Supabase Auth:', deleteError.message);
          } else {
            console.log(`  ✓ Deleted user from Supabase Auth`);
          }
        } else {
          console.log('  ℹ️  User not found in Supabase Auth (may have been already deleted)');
        }
      }
    } else {
      console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY not found - skipping Supabase Auth deletion');
      console.log('     You will need to manually delete this user from Supabase dashboard');
    }

    console.log('\n✅ User deletion completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error deleting user:', error);
    process.exit(1);
  }
}

deleteUser(email);

