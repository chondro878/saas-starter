# Fulfillment System Setup Guide

## Overview

This system automates the order creation process for greeting cards. Every night at 2 AM, it creates orders for occasions happening 15 days from now. You can then print labels and reminder cards from the fulfillment dashboard.

## Features

- ✅ Automated order creation (15 days before occasion)
- ✅ Avery 5160 label printing (1" x 2.625")
- ✅ Reminder card printing (3" x 5")
- ✅ Subscription card tracking (with yearly limits)
- ✅ Bulk holiday pack support
- ✅ Individual card purchases
- ✅ Order status tracking (pending → printed → mailed)
- ✅ Customer order history

## Database Setup

### 1. Run Migration

Run the migration to create the orders table:

```bash
npm run db:push
# or
npx drizzle-kit push:pg
```

This will create the `orders` table with all necessary fields.

## Environment Variables

Add this to your `.env` file:

```bash
# Cron job security
CRON_SECRET=your-secure-random-string-here
```

Generate a secure random string for `CRON_SECRET`:

```bash
openssl rand -base64 32
```

## Vercel Cron Setup

The cron job is configured in `vercel.json` to run daily at 2 AM:

```json
{
  "crons": [
    {
      "path": "/api/cron/create-orders",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Vercel Deployment

1. Deploy to Vercel
2. Add `CRON_SECRET` environment variable in Vercel dashboard
3. Cron will automatically run on schedule

### Local Testing

Test the cron job locally:

```bash
curl -X GET http://localhost:3000/api/cron/create-orders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Daily Workflow

### Morning Routine (Your Workflow)

1. **Open Fulfillment Dashboard**
   - Navigate to `/dashboard/fulfillment`
   - View all pending orders for today

2. **Print Labels**
   - Click "Print All Labels"
   - Prints recipient address + return address (2 labels per order)
   - Loads into Brother laser printer
   - Avery 5160 format: 30 labels per sheet

3. **Print Reminder Cards**
   - Click "Print All Cards"
   - Prints 3" x 5" reminder cards
   - Shows recipient name, occasion, and date
   - Indicates card type (subscription/bulk/individual)

4. **Stuff Envelopes**
   - Insert greeting card + printed reminder card into envelope
   - Apply printed Avery labels (recipient on front, return on back)
   - Stamp envelope

5. **Mark as Sent**
   - Click "Mark as Sent" for each order
   - Or mark individual orders as sent

6. **Drop at Post Office**
   - Take to USPS

## Card Type System

The system tracks three types of cards:

### Subscription Cards
- Included in user's subscription plan
- Limits: Essentials (5/year), Stress Free (12/year), Concierge (25/year)
- Tracked in yearly totals
- Auto-created by cron job

### Bulk Holiday Pack Cards
- Purchased separately ($39 for 15 cards)
- Not counted against subscription limit
- Manually created or via holiday pack purchase

### Individual Cards
- Extra cards purchased individually ($9/card)
- Not counted against subscription limit
- Manually created or via individual purchase

## User Experience

### For Customers

1. **Add Recipients**
   - Enter recipient details (name, address)
   - Add occasions (birthday, anniversary, etc.)

2. **View Order History**
   - Navigate to `/dashboard/orders`
   - See all past and upcoming orders
   - Track order status
   - View card usage by type

### Order Statuses

- **Pending**: Order created, needs to be printed (shows in fulfillment dashboard)
- **Printed**: You've printed labels/cards but haven't mailed yet
- **Mailed**: Order completed and sent
- **Cancelled**: Order cancelled (recipient deleted, etc.)

## API Endpoints

### Cron Job
- `GET /api/cron/create-orders` - Creates orders for occasions 15 days away
- Requires `Authorization: Bearer {CRON_SECRET}` header

### Order Management
- `POST /api/orders/[id]/mark-printed` - Mark single order as printed
- `POST /api/orders/[id]/mark-sent` - Mark single order as sent
- `POST /api/orders/mark-all-printed` - Mark multiple orders as printed

## Subscription Limits

The system automatically checks card limits based on subscription:

| Plan | Cards/Year | Price |
|------|-----------|-------|
| Essentials | 5 | $49 |
| Stress Free | 12 | $99 |
| Concierge | 25 | $199 |

**Note**: Bulk packs and individual cards do NOT count against subscription limits.

## Order Creation Logic

The nightly cron job will:

1. ✅ Find occasions 15 days from now (by month/day)
2. ✅ Check if order already exists for this year
3. ✅ Verify user has active subscription
4. ✅ Check card limit hasn't been reached
5. ✅ Verify user has default return address
6. ✅ Create order with snapshot of current addresses
7. ❌ Skip if any check fails (logged for review)

## Troubleshooting

### Cron Job Not Running

1. Check `CRON_SECRET` is set in Vercel
2. Verify cron is enabled in Vercel project settings
3. Check Vercel logs for errors

### Orders Not Created

Check cron job response for skipped orders:

```bash
curl -X GET https://your-app.vercel.app/api/cron/create-orders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Common skip reasons:
- No active subscription
- Card limit reached
- No default address set
- Order already exists

### Print Issues

- Verify jsPDF is installed: `npm list jspdf`
- Check browser console for errors
- Test with single order first

## Future Enhancements

Potential improvements:

- [ ] Bulk card purchase tracking
- [ ] Individual card purchase flow
- [ ] Email notifications when cards are mailed
- [ ] Analytics dashboard (cards sent per month, etc.)
- [ ] Card design selection
- [ ] Custom message on reminder cards
- [ ] Automated address validation before order creation
- [ ] Holiday pack auto-ordering system

## Support

For issues or questions:
1. Check Vercel logs for cron job errors
2. Review order creation logs in API response
3. Verify database migration completed successfully

