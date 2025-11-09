import { db } from './drizzle';
import { users } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

async function checkUsers() {
  console.log('📋 Checking users in database...\n');

  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    role: users.role,
    firstName: users.firstName,
    lastName: users.lastName,
  }).from(users);

  if (allUsers.length === 0) {
    console.log('❌ No users found in database');
    return;
  }

  console.log(`✅ Found ${allUsers.length} user(s):\n`);
  
  for (const user of allUsers) {
    console.log(`  - ID: ${user.id}`);
    console.log(`    Email: ${user.email}`);
    console.log(`    Role: ${user.role}`);
    console.log(`    Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
    console.log('');
  }

  // Reset test user password
  const testUser = allUsers.find(u => u.email === 'test@test.com');
  if (testUser) {
    console.log('🔧 Resetting password for test@test.com to "admin123"...');
    const newPasswordHash = await hashPassword('admin123');
    
    await db.update(users)
      .set({ 
        passwordHash: newPasswordHash,
        role: 'owner', // Make sure they're an owner
      })
      .where(eq(users.id, testUser.id));
    
    console.log('✅ Password reset complete!');
    console.log('\n📋 Login credentials:');
    console.log('   Email: test@test.com');
    console.log('   Password: admin123');
  }
}

checkUsers()
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  });

