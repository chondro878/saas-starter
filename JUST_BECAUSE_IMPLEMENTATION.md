# Just Because Feature - Phase 1 Implementation

## Overview
The "Just Because" feature allows users to send surprise cards at randomly selected dates throughout the year. The system intelligently avoids conflicts with existing occasions and holidays.

## Features Implemented

### 1. Dynamic Card Types Based on Relationship
- **Friend/Family**: "Thinking of You" card
- **Romantic**: "Romantic" card  
- **Professional**: "Recognition" card

### 2. Smart Date Selection
- Random date is calculated at least 30 days in the future
- Avoids existing birthdays, anniversaries, and other recipient occasions (±14 days buffer)
- Avoids major holidays (±14 days buffer):
  - New Year's Day, Valentine's Day, St. Patrick's Day
  - Independence Day, Halloween, Christmas, New Year's Eve
  - Mother's Day, Father's Day, Easter, Thanksgiving

### 3. Annual Recurrence
- Just Because occasions automatically recur every year
- Tracked via `lastSentYear` field to prevent duplicate orders

### 4. Surprise Factor
- Computed send date is hidden from users
- Shows "🎉 Surprise date!" in the UI instead

### 5. Automatic Rescheduling
- If a new birthday/anniversary conflicts with an existing Just Because date
- System automatically recalculates a new safe date
- No user notification required

## Database Changes

### New Migration: `0006_add_just_because_fields.sql`
Added columns to `occasions` table:
- `is_just_because` (boolean): Identifies Just Because occasions
- `computed_send_date` (timestamp): Hidden random send date
- `card_variation` (varchar): Type of card (thinking_of_you, romantic, recognition)
- `last_sent_year` (integer): Tracks annual recurrence

### Indexes Created
- `occasions_computed_send_date_idx`: For efficient cron queries
- `occasions_is_just_because_idx`: For filtering Just Because occasions

## Files Modified

### Core Logic
1. **`lib/db/schema.ts`**
   - Added Just Because fields to occasions table
   - Added boolean type import

2. **`lib/just-because-scheduler.ts`** (NEW - SERVER-SIDE ONLY)
   - `calculateJustBecauseDate()`: Generates random safe dates
   - `rescheduleJustBecauseIfNeeded()`: Handles conflict resolution
   - Requires database access - only used in API routes and cron jobs

3. **`lib/just-because-utils.ts`** (NEW - CLIENT-SAFE)
   - `getCardVariation()`: Maps relationship to card type
   - `getJustBecauseLabel()`: Returns display label based on relationship
   - Pure utility functions - can be imported in client components

4. **`lib/db/queries-just-because.ts`** (NEW)
   - `hasJustBecauseOccasion()`: Checks if recipient has Just Because
   - `getJustBecauseOccasion()`: Retrieves Just Because occasion

### Frontend
4. **`app/create-reminder/page.tsx`**
   - Added "Just Because" to occasion selection
   - Dynamic label based on relationship type
   - Shows "We'll pick a surprise date!" hint
   - Skips date picker for Just Because
   - Shows "🎉 Surprise date!" in review step
   - Updated save logic to include Just Because data

### Backend
5. **`app/api/recipients/route.ts`**
   - Enhanced POST endpoint to handle Just Because occasions
   - Calculates random date when creating Just Because
   - Stores cardVariation based on relationship

6. **`app/api/cron/create-orders/route.ts`**
   - Queries both regular and Just Because occasions
   - Checks `lastSentYear` to prevent duplicate annual orders
   - Updates `lastSentYear` after order creation

## How It Works

### User Flow
1. User selects a relationship type (Friend, Family, Romantic, Professional)
2. User selects "Just Because" in occasion selection
3. Label dynamically updates based on relationship
4. User skips date picker (handled automatically)
5. Review shows "Surprise date!" instead of actual date
6. Backend calculates random safe date on save

### System Flow
1. **Occasion Creation**:
   - API receives Just Because occasion
   - Calculates random date avoiding conflicts
   - Stores with `isJustBecause=true` and computed date

2. **Order Generation (Cron)**:
   - Daily cron checks for occasions 15 days out
   - Finds Just Because occasions matching computed date
   - Only processes if not sent this year (`lastSentYear`)
   - Creates order and updates `lastSentYear`

3. **Annual Recurrence**:
   - Next year, same occasion is eligible again
   - New order created on the same computed date
   - Continues indefinitely

## Testing Checklist

### Manual Testing
- [ ] Create Just Because for Friend → Shows "Thinking of You"
- [ ] Create Just Because for Family → Shows "Thinking of You"
- [ ] Create Just Because for Romantic → Shows "Romantic"
- [ ] Create Just Because for Professional → Shows "Recognition"
- [ ] Date picker is skipped when only Just Because selected
- [ ] Review shows "🎉 Surprise date!"
- [ ] Computed date is at least 30 days in future
- [ ] Computed date avoids existing occasions (±14 days)
- [ ] Computed date avoids major holidays (±14 days)

### Database Testing
- [ ] Run migration: `npm run db:push` or execute SQL manually
- [ ] Verify new columns exist in `occasions` table
- [ ] Verify indexes created

### Cron Testing
- [ ] Cron finds Just Because occasions 15 days before computed date
- [ ] Order created with correct card variation
- [ ] `lastSentYear` updated after order creation
- [ ] Same occasion not processed twice in same year

## Configuration

### Constants (can be adjusted in `just-because-scheduler.ts`)
- `BUFFER_DAYS`: 14 days (buffer around occasions/holidays)
- `MAJOR_HOLIDAYS`: Array of fixed holidays to avoid
- Minimum future date: 30 days

## Phase 2 - Easy Apply Card Credit Feature ✅ IMPLEMENTED

### Features Completed
- ✅ Quick button in dashboard
- ✅ "Use 1 Credit for Just Because" with dropdown
- ✅ Shows all recipients with Just Because occasions
- ✅ One-click credit application
- ✅ Creates order immediately
- ✅ Real-time credit balance updates
- ✅ Success/error messaging
- ✅ Responsive mobile-friendly design

**See**: `JUST_BECAUSE_PHASE2_IMPLEMENTATION.md` for detailed documentation

### API Endpoints Added
- `GET /api/just-because/recipients` - Fetch Just Because recipients
- `POST /api/just-because/apply-credit` - Apply credit to occasion

### Components Added
- `app/(dashboard)/components/just-because-credit-apply.tsx` - Main UI component

---

## Future Enhancements (Phase 3+)
- Multiple Just Because per recipient (if needed)
- Custom buffer days per user
- Ability to preview/regenerate date before saving
- Admin tools for monitoring Just Because schedules
- Bulk credit application
- Auto-apply on purchase option

## Migration Instructions

1. **Backup Database** (recommended)
   ```bash
   # If using Supabase
   supabase db dump > backup.sql
   ```

2. **Run Migration**
   ```bash
   # Option 1: Using Drizzle
   npm run db:push
   
   # Option 2: Manual SQL execution
   # Execute the contents of lib/db/migrations/0006_add_just_because_fields.sql
   # in your database client
   ```

3. **Verify Migration**
   ```sql
   -- Check new columns exist
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'occasions' 
   AND column_name IN ('is_just_because', 'computed_send_date', 'card_variation', 'last_sent_year');
   
   -- Check indexes exist
   SELECT indexname FROM pg_indexes WHERE tablename = 'occasions';
   ```

4. **Restart Application**
   ```bash
   # Restart dev server or redeploy
   npm run dev
   ```

## Notes

- **Surprise Factor**: Users never see the computed date - maintains surprise
- **One Per Recipient**: Currently limited to 1 Just Because per recipient
- **No Notifications**: No email sent when Just Because is scheduled
- **Card Credits**: Phase 2 will add easy credit application
- **Performance**: Indexes ensure efficient cron queries at scale
- **Client/Server Separation**: The `just-because-scheduler.ts` is server-only (uses database). Client components use `just-because-utils.ts` for display logic only.

## Support

For issues or questions:
1. Check logs: `console.log('[Just Because]...')` statements
2. Verify database fields populated correctly
3. Test date calculation logic in isolation
4. Check cron job logs for order creation

---

**Implementation Status**: ✅ Phase 1 & Phase 2 Complete  
**Last Updated**: November 23, 2025  
**Documentation**: 
- Phase 1: This file
- Phase 2: `JUST_BECAUSE_PHASE2_IMPLEMENTATION.md`

