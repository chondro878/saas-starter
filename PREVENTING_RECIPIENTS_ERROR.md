# Preventing "Failed to Load Recipients" Errors

## Root Cause
The error occurs when the database schema and the application code are out of sync. Specifically:
- Code expects certain database columns to exist
- Database is missing those columns
- API queries fail with 500 errors

## Solution Applied

### 1. Ran Missing Migration
**Problem**: The `occasions` table was missing "Just Because" columns:
- `is_just_because`
- `computed_send_date`
- `card_variation`
- `last_sent_year`

**Fix**: Ran the migration in `/lib/db/migrations/0006_add_just_because_fields.sql`

### 2. Restarted Dev Server
**Problem**: Hot Module Replacement (HMR) doesn't always pick up database schema changes

**Fix**: Full server restart to reload all modules with updated schema

## How to Prevent This in the Future

### When Adding New Database Columns:

1. **Update Schema** (`lib/db/schema.ts`)
   ```typescript
   export const occasions = pgTable('occasions', {
     // ... existing columns
     newColumn: varchar('new_column', { length: 50 }),
   });
   ```

2. **Create Migration SQL**
   ```sql
   -- lib/db/migrations/XXXX_description.sql
   ALTER TABLE occasions ADD COLUMN new_column VARCHAR(50);
   ```

3. **Run Migration**
   ```bash
   node -r dotenv/config run-migration.js
   # or create a custom script to run the SQL file
   ```

4. **Restart Dev Server**
   ```bash
   # Kill all Next.js processes
   pkill -f "next dev"
   
   # Start fresh
   npm run dev
   ```

5. **Verify Columns Exist**
   ```bash
   # Quick check
   psql $DATABASE_URL -c "\d occasions"
   ```

### When Deploying to Production:

1. ✅ Run migrations FIRST (before deploying code)
2. ✅ Verify migrations succeeded
3. ✅ Then deploy application code
4. ✅ Never deploy code that expects columns that don't exist yet

## Emergency Fix Script

If the error happens again, run this diagnostic:

```javascript
// check-schema-sync.js
const postgres = require('postgres');
require('dotenv/config');

async function checkSync() {
  const client = postgres(process.env.POSTGRES_URL);
  
  // Check occasions table columns
  const columns = await client`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'occasions'
  `;
  
  const requiredColumns = [
    'id', 'recipient_id', 'occasion_type', 'occasion_date', 
    'notes', 'created_at', 'is_just_because', 'computed_send_date',
    'card_variation', 'last_sent_year'
  ];
  
  const existingColumns = columns.map(c => c.column_name);
  const missing = requiredColumns.filter(col => !existingColumns.includes(col));
  
  if (missing.length > 0) {
    console.error('❌ Missing columns:', missing.join(', '));
    console.log('Run migrations to fix!');
  } else {
    console.log('✅ All columns exist!');
  }
  
  await client.end();
}

checkSync();
```

## Improved Error Handling

Added better error logging to `/app/api/recipients/route.ts`:
```typescript
catch (error) {
  console.error('Error fetching recipients:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  console.error('Error details:', error instanceof Error ? error.message : String(error));
  return NextResponse.json({ 
    error: 'Internal server error',
    details: error instanceof Error ? error.message : String(error)
  }, { status: 500 });
}
```

This provides more detailed error messages for debugging.

## Current Status

✅ **Database**: All Just Because columns added successfully
✅ **Server**: Restarted with fresh modules
✅ **API**: Returning 200 status codes
✅ **Dashboard**: Loading all 9 recipients correctly

The "Failed to load recipients" error is now fixed and shouldn't occur again as long as migrations are run before code changes that depend on them.

