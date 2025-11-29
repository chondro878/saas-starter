# Card Limit Warning System

## Overview
Implements a psychological upsell flow that allows users to add all their recipients and occasions first, then shows them how many cards they need - creating natural commitment escalation.

## Key Components

### 1. Card Allocation Logic (`lib/card-allocation.ts`)
- Calculates total cards scheduled vs available
- Breaks down: subscription cards + extra cards = total available
- Identifies shortfall and generates cost estimates
- Maps Stripe product IDs to card limits (Basic: 5, Pro: 15, Concierge: 25)

### 2. API Endpoint (`/api/card-allocation`)
- `GET /api/card-allocation` - Returns CardAllocation object
- Counts all occasions across all recipients for authenticated user
- Calculates allocation based on team's subscription and card credits

### 3. CardLimitWarning Component
**Location:** `components/ui/card-limit-warning.tsx`

**Used on:** Create reminder success screen (Step 6)

**Features:**
- Shows breakdown of scheduled vs available cards
- Displays shortfall prominently
- Two CTA options:
  - "Buy X cards" (one-time purchase, $9 each)
  - "Upgrade plan" (up to 25 cards/year)
- Optional dismiss button
- No emojis in copy (per user request)

### 4. DashboardCardLimitBanner Component
**Location:** `components/ui/dashboard-card-limit-banner.tsx`

**Used on:** Dashboard home page

**Features:**
- Persistent warning banner when user exceeds card limit
- Shows total shortfall
- CTAs to buy cards or upgrade
- Dismissible (persists in session only)

## User Flow

### Creating a Reminder (The Psychology Win)
1. User adds recipient details (Step 1-2)
2. User selects ALL occasions they want (Step 3-4)
   - No mention of card limits
   - No artificial constraints
   - Full freedom to add everything
3. User adds notes (Step 5)
4. User reviews and submits (Step 5)
5. SUCCESS screen shows:
   - "Reminder Created!" confirmation
   - **If over limit:** Card allocation warning with options
   - Buttons: "Create Another" or "Go to Dashboard"

### On Dashboard
- If user has scheduled more cards than available:
  - Amber banner appears at top
  - Shows shortfall count
  - Links to purchase or upgrade

## Why This Works

### Commitment Escalation
1. User invests time adding all their people
2. User sees the value (e.g., "12 cards needed!")
3. User has already emotionally committed to these people
4. Purchase becomes obvious: "Of course I need those extra cards"

### No Artificial Scarcity
- Doesn't force users to choose between loved ones
- Reveals full need before asking for payment
- Similar to: shopping cart totals, wedding guest lists

### Natural Upsell Moments
- Post-creation success (high engagement)
- Dashboard reminder (persistent awareness)
- Never blocks or frustrates

## Configuration

### Subscription Card Limits
Edit in `lib/card-allocation.ts`:
```typescript
const planLimits: Record<string, number> = {
  'prod_basic': 5,      // Basic plan: 5 cards/year
  'prod_pro': 15,       // Pro plan: 15 cards/year  
  'prod_concierge': 25, // Concierge: 25 cards/year
};
```

### Card Pricing
Default: $9 per card (set in `calculateCardCost()`)

## Files Modified

1. `lib/card-allocation.ts` (new) - Core calculation logic
2. `components/ui/card-limit-warning.tsx` (new) - Success screen warning
3. `components/ui/dashboard-card-limit-banner.tsx` (new) - Dashboard banner
4. `app/api/card-allocation/route.ts` (new) - API endpoint
5. `app/create-reminder/page.tsx` - Integrated warning on success
6. `app/(dashboard)/dashboard/page.tsx` - Added dashboard banner
7. `app/(dashboard)/dashboard/friendsandfamily/page.tsx` - Refresh allocation
8. `app/(dashboard)/components/card-credit-purchase.tsx` - Updated copy

## Testing Checklist

- [ ] Create recipient with 0 occasions → No warning shown
- [ ] Create recipient with occasions exceeding plan → Warning shown on success
- [ ] Dashboard shows banner when over limit
- [ ] Banner dismisses but reappears on refresh (if still over limit)
- [ ] Card count calculation is accurate
- [ ] CTA buttons navigate correctly
- [ ] Works for users with no subscription (0 cards available)
- [ ] Works for users with extra card credits

## Future Enhancements

1. Email notification when user approaches limit
2. Warning in reminder form if >80% of cards used
3. Annual renewal reminders about unused cards
4. Bulk discount for large card purchases

