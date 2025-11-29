#!/usr/bin/env node
/**
 * Database Health Check Script
 * Run this to verify all required database columns exist
 * Usage: npm run db:check
 */

const postgres = require('postgres');
require('dotenv/config');

async function checkDatabaseHealth() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ Missing DATABASE_URL or POSTGRES_URL in .env');
    process.exit(1);
  }
  
  const client = postgres(connectionString);
  
  try {
    console.log('🔍 Running database health check...\n');
    
    // Check database connection
    await client`SELECT 1`;
    console.log('✅ Database connection successful\n');
    
    // Define required columns for each table
    const requiredColumns = {
      users: ['id', 'email', 'name', 'created_at', 'updated_at'],
      teams: ['id', 'name', 'card_credits', 'created_at'],
      recipients: [
        'id', 'user_id', 'first_name', 'last_name', 'relationship',
        'street', 'city', 'state', 'zip', 'notes',
        'address_status', 'address_notes', 'address_verified_at',
        'created_at', 'updated_at'
      ],
      occasions: [
        'id', 'recipient_id', 'occasion_type', 'occasion_date', 'notes',
        'is_just_because', 'computed_send_date', 'card_variation', 'last_sent_year',
        'created_at'
      ],
      orders: [
        'id', 'user_id', 'occasion_id', 'status', 
        'card_type', 
        'created_at'
      ],
    };
    
    let hasIssues = false;
    
    // Check each table
    for (const [tableName, expectedColumns] of Object.entries(requiredColumns)) {
      const columns = await client`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      const existingColumns = columns.map(c => c.column_name);
      const missingColumns = expectedColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error(`❌ Table "${tableName}" is missing columns:`);
        missingColumns.forEach(col => console.error(`   - ${col}`));
        hasIssues = true;
      } else {
        console.log(`✅ Table "${tableName}" has all required columns (${existingColumns.length} total)`);
      }
    }
    
    console.log('');
    
    if (hasIssues) {
      console.error('❌ Database health check FAILED');
      console.error('\n📝 Action required: Run migrations to add missing columns');
      console.error('   Check lib/db/migrations/ for pending migrations\n');
      process.exit(1);
    } else {
      console.log('🎉 Database health check PASSED - All tables and columns are present!\n');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    await client.end();
    process.exit(1);
  }
}

checkDatabaseHealth();

