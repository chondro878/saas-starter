# Delivery Window Warning Implementation

## Overview
Added user-facing warnings throughout the `/create-reminder` flow to inform users when occasions cannot be fulfilled within the current year due to the 15-day delivery window requirement.

## Problem Solved
Previously, if a user added an occasion less than 15 days away (e.g., Christmas on December 15th), they wouldn't know the card would be sent next year instead of this year. This could lead to confusion and disappointment.

## Solution: Hybrid Approach (Option 1 + Option 2)

### 1. Real-Time Warnings (Option 1)
**In-line warnings appear immediately when users select/enter dates:**

#### Step 3: Holiday Selection
- **Location**: After the Holidays fieldset
- **Triggers**: When a selected holiday is < 15 days away
- **UI**: Amber alert box for each affected holiday
- **Message**: "Christmas is only 10 days away. We'll send the card for December 2026."

#### Step 4: Date Selection
- **Location**: Below MonthDayPicker for each custom occasion
- **Triggers**: When a selected birthday/anniversary date is < 15 days away
- **UI**: Amber alert box with detailed explanation
- **Message**: "This birthday is only 9 days away, but we need 15 days to print and ship your card. We'll automatically send it for December 10, 2026."

### 2. Consolidated Summary (Option 2)
**Review step shows all affected occasions in one place:**

#### Step 5: Review & Notes
- **Location**: Top of review section, after recipient details
- **Triggers**: When ANY occasion (custom or holiday) is < 15 days away
- **UI**: Blue info box with bulleted list
- **Message**: Lists all occasions that will be fulfilled next year with:
  - Occasion name and original date
  - Days remaining
  - Exact fulfillment date (next year)
  - Reassuring message

## Technical Implementation

### New Utility File: `lib/delivery-window.ts`

```typescript
export const DELIVERY_WINDOW_DAYS = 15;

// Calculate days until a given date
export function getDaysUntilDate(date: Date): number

// Check if date is within delivery window (>= 15 days)
export function isWithinDeliveryWindow(date: Date): boolean

// Get the year when occasion will be fulfilled
export function getNextFulfillableYear(date: Date): number

// Comprehensive check for both custom and holiday occasions
export function checkOccasionDeliveryStatus(
  occasionType: string,
  customDate?: Date
): {
  isTooSoon: boolean;
  daysUntil: number;
  fulfillmentDate: Date;
  fulfillmentYear: number;
}
```

### Changes to `app/create-reminder/page.tsx`

1. **Import**: Added `checkOccasionDeliveryStatus` from delivery-window utils
2. **Step 3**: Added holiday warnings after the Holidays fieldset
3. **Step 4**: Added custom occasion warnings below each MonthDayPicker
4. **Step 5**: Added consolidated delivery timeline summary box

## User Experience

### Example Scenario 1: December 1st
User adds:
- ✅ **Christmas** (Dec 25) - 24 days away → Will send this year
- ✅ **New Year's** (Jan 1) - 31 days away → Will send this year
- ⚠️ **Birthday** (Dec 10) - 9 days away → **Warning shown**, will send Dec 10, 2026

### Example Scenario 2: December 15th
User adds:
- ⚠️ **Christmas** (Dec 25) - 10 days away → **Warning shown**, will send Dec 25, 2026
- ✅ **Valentine's Day** (Feb 14) - 61 days away → Will send this year
- ⚠️ **Anniversary** (Dec 20) - 5 days away → **Warning shown**, will send Dec 20, 2026

## Key Features

✅ **Comprehensive**: Covers both custom occasions AND holidays
✅ **Contextual**: Warnings appear where users make decisions
✅ **Non-blocking**: Users can proceed, just informed
✅ **Consolidated**: Summary at review step shows full impact
✅ **Clear expectations**: Exact dates shown for fulfillment
✅ **Reassuring**: Positive messaging that system will handle it

## Visual Hierarchy

1. **Amber warnings** (⚠️) - Individual occasion warnings (Steps 3 & 4)
   - Immediate, contextual feedback
   - Per-occasion basis
   - Shows days remaining and next year's date

2. **Blue info box** (💡) - Consolidated summary (Step 5)
   - All affected occasions in one view
   - Final confirmation before submission
   - Reassuring tone with helpful emoji

## Testing Checklist

- [ ] Add Christmas in December (< 15 days) - Should show warning in Step 3
- [ ] Add birthday < 15 days away - Should show warning in Step 4
- [ ] Add multiple occasions, some < 15 days - Should show consolidated list in Step 5
- [ ] Add occasions > 15 days away - No warnings should appear
- [ ] Check formatting of dates in warnings
- [ ] Verify warnings don't block submission
- [ ] Test with different relationships (anniversary labeling)

## Future Enhancements

- Dashboard indicator for occasions scheduled > 1 year out
- Email notification when next year's occasion approaches
- Ability to manually adjust fulfillment year for edge cases

