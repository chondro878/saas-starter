#!/usr/bin/env tsx
/**
 * This script adds the missing card_credits column to the teams table.
 * Run this after stopping your dev server to avoid connection pool issues.
 */

import { sql } from 'drizzle-orm';
import { db } from '../lib/db/drizzle';

async function fixDatabase() {
  console.log('🔧 Fixing database schema...\n');
  
  try {
    console.log('Adding card_credits column to teams table...');
    
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'teams' AND column_name = 'card_credits'
          ) THEN
              ALTER TABLE "teams" ADD COLUMN "card_credits" integer DEFAULT 0 NOT NULL;
              RAISE NOTICE 'Column card_credits added successfully';
          ELSE
              RAISE NOTICE 'Column card_credits already exists';
          END IF;
      END $$;
    `);
    
    console.log('✅ Database schema fixed successfully!\n');
    console.log('You can now restart your dev server with: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    console.error('\nMake sure your dev server is stopped before running this script.');
    process.exit(1);
  }
}

fixDatabase();

