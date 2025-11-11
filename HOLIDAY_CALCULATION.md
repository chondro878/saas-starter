# Holiday Date Calculation System

## Overview

This app includes a robust system for calculating accurate holiday dates, including variable holidays like Easter, Mother's Day, Father's Day, and Thanksgiving that change dates each year.

## Architecture

### 1. **Shared Utilities** (`lib/holiday-calculator.ts`)

Central location for all holiday calculation logic:

- **`calculateHolidayDate(holidayName)`** - Calculates next occurrence of a holiday
- **`calculateHolidayForYear(holidayName, year)`** - Calculates holiday for specific year
- **`calculateEaster(year)`** - Uses Anonymous Gregorian algorithm (Computus)
- **`getNthDayOfMonth(year, month, day, n)`** - Finds Nth occurrence of weekday
- **`isVariableHoliday(holidayName)`** - Checks if holiday changes annually
- **`VARIABLE_HOLIDAYS`** - List of holidays requiring yearly recalculation

### 2. **Initial Creation** (`app/create-reminder/page.tsx`)

When users create a reminder with a holiday:
- Uses `calculateHolidayDate()` to get the next occurrence
- Stores the calculated date in the `occasions` table
- Works for both fixed (Christmas, July 4th) and variable holidays (Easter, Mother's Day)

**Example:**
```typescript
// User selects "Mother's Day" in December 2024
calculateHolidayDate("Mother's Day")
// Returns: May 11, 2025 (2nd Sunday of May 2025)
```

### 3. **Yearly Updates** (`app/api/cron/update-holiday-dates/route.ts`)

Cron job that runs **January 1st at midnight** each year:

**What it does:**
1. Identifies all occasions with variable holiday types
2. Recalculates dates for current year
3. Updates database records

**Why it's needed:**
- **Mother's Day 2024**: May 12 (2nd Sunday)
- **Mother's Day 2025**: May 11 (2nd Sunday)
- **Mother's Day 2026**: May 10 (2nd Sunday)

The stored date needs updating each year to match the actual calendar.

### 4. **Order Creation** (`app/api/cron/create-orders/route.ts`)

Daily cron job (2am) that creates card orders:
- Looks 15 days ahead
- Matches occasions by **month + day** only
- Creates orders for upcoming occasions

**Important:** Only matches on month/day, not year, so updates are crucial for accuracy.

## Supported Holidays

### Fixed Holidays (Same date every year)
- New Year's Day (January 1)
- Valentine's Day (February 14)
- St. Patrick's Day (March 17)
- Independence Day (July 4)
- Halloween (October 31)
- Christmas (December 25)

### Variable Holidays (Change yearly)
- **Easter** - First Sunday after first full moon after spring equinox
- **Mother's Day** - 2nd Sunday of May
- **Father's Day** - 3rd Sunday of June
- **Thanksgiving** - 4th Thursday of November

## Cron Schedule

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/create-orders",
      "schedule": "0 2 * * *"           // Daily at 2am
    },
    {
      "path": "/api/cron/update-holiday-dates",
      "schedule": "0 0 1 1 *"           // January 1 at midnight
    }
  ]
}
```

## Cron Schedule Format

Standard cron syntax: `minute hour day month day-of-week`

- `0 2 * * *` = Every day at 2:00am
- `0 0 1 1 *` = January 1st at midnight

## Testing

### Test the Holiday Calculator

```typescript
import { calculateHolidayDate, calculateHolidayForYear } from '@/lib/holiday-calculator';

// Get next occurrence
const nextEaster = calculateHolidayDate("Easter");
console.log(nextEaster); // Next Easter date

// Get specific year
const easter2025 = calculateHolidayForYear("Easter", 2025);
console.log(easter2025); // Easter 2025: April 20, 2025
```

### Test the Cron Job Manually

```bash
# Make sure CRON_SECRET is set in .env.local
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/cron/update-holiday-dates
```

## Security

Both cron endpoints require authentication via `CRON_SECRET` environment variable:

```env
CRON_SECRET=your-secret-token-here
```

Vercel automatically includes this header when triggering scheduled crons.

## Maintenance

The calculation algorithms are proven and stable:
- **Easter algorithm**: Used since 16th century, accurate for all Gregorian years
- **Weekday calculations**: Standard date mathematics
- **No external dependencies**: All calculations are local

### Adding New Holidays

To add a new holiday:

1. **Update `lib/holiday-calculator.ts`:**
   ```typescript
   case "New Holiday Name":
     return new Date(year, month, day);
   ```

2. **If variable, add to `VARIABLE_HOLIDAYS` array:**
   ```typescript
   export const VARIABLE_HOLIDAYS = [
     "Easter",
     "Mother's Day",
     "Father's Day",
     "Thanksgiving",
     "New Holiday Name"  // Add here
   ] as const;
   ```

3. **Update form in `app/create-reminder/page.tsx`:**
   ```typescript
   const holidayOccasions = [
     // ... existing
     { value: "New Holiday Name", label: "New Holiday Name", dateLabel: "varies" },
   ];
   ```

## Monitoring

Check cron job execution logs:
- Vercel Dashboard → Your Project → Logs → Filter by "CRON"
- Look for `[CRON] Starting holiday date update job...`
- Verify successful updates each January 1st

## Troubleshooting

**Q: What if the cron job fails?**
A: It can be manually triggered via the API endpoint. The next January 1st will catch any missed updates.

**Q: What happens to past years' dates?**
A: They're updated to current year. The order creation cron only matches month/day, so the year value is primarily for display/tracking purposes.

**Q: Can I run the update job more than once a year?**
A: Yes, it's idempotent. Running multiple times has no negative effect.

**Q: What if a user creates a reminder mid-year?**
A: The form uses `calculateHolidayDate()` which automatically calculates the correct upcoming occurrence.

