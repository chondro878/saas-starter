# Stripe Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```bash
# Existing Stripe variables (already setup)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New: Stripe Price IDs (for subscriptions)
NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS=price_1234567890
NEXT_PUBLIC_STRIPE_PRICE_STRESS_FREE=price_0987654321
NEXT_PUBLIC_STRIPE_PRICE_CONCIERGE=price_abcdef12345
```

## How to Get Price IDs

### 1. Go to Stripe Dashboard
Visit: https://dashboard.stripe.com/products

### 2. Create Your Products

You need to create **3 products** matching your plans:

#### Product 1: Essentials
- **Name**: `Essentials`
- **Description**: For close family
- **Pricing**: 
  - Amount: **$49.00 USD**
  - Billing period: **Yearly**
- After creating, copy the **Price ID** (starts with `price_`)

#### Product 2: Stress Free
- **Name**: `Stress Free`
- **Description**: Most popular
- **Pricing**: 
  - Amount: **$99.00 USD**
  - Billing period: **Yearly**
- After creating, copy the **Price ID**

#### Product 3: Concierge
- **Name**: `Concierge`
- **Description**: Full service
- **Pricing**: 
  - Amount: **$199.00 USD**
  - Billing period: **Yearly**
- After creating, copy the **Price ID**

### 3. Update Environment Variables

Add the Price IDs to your `.env`:

```bash
NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS=price_YOUR_ESSENTIALS_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_STRESS_FREE=price_YOUR_STRESSFREE_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_CONCIERGE=price_YOUR_CONCIERGE_PRICE_ID
```

### 4. Restart Dev Server

```bash
npm run dev
```

### 5. Test Checkout Flow

1. Visit http://localhost:3000/pricing
2. Click "Start 14-Day Free Trial" on any plan
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Any future expiration date
   - Any 3-digit CVC
   - Any ZIP code

## Webhook Configuration

Your Stripe webhook is already configured at `/api/stripe/webhook` and handles:

- ✅ `customer.subscription.updated` - When subscription changes
- ✅ `customer.subscription.deleted` - When subscription is cancelled

The webhook automatically updates:
- Subscription status in database
- Plan name
- Stripe customer/subscription IDs

## Subscription Flow

### What Happens When a User Subscribes:

1. **User clicks "Subscribe Now"** → Redirected to Stripe Checkout
2. **Enters payment info** → Creates Stripe subscription (charged immediately)
3. **Redirected back** → `/api/stripe/checkout` processes the session
4. **Database updated**:
   - `teams.stripeCustomerId` = Stripe customer ID
   - `teams.stripeSubscriptionId` = Subscription ID
   - `teams.planName` = "Essentials", "Stress Free", or "Concierge"
   - `teams.subscriptionStatus` = "active"
5. **Cron job checks status** → Only creates orders for active subscriptions

### Subscription Statuses

| Status | Description | Orders Created? |
|--------|-------------|-----------------|
| `active` | Paid & active | ✅ Yes |
| `past_due` | Payment failed | ❌ No |
| `canceled` | User cancelled | ❌ No |
| `unpaid` | Multiple failed payments | ❌ No |
| `incomplete` | Initial payment failed | ❌ No |
| `trialing` | Trial (not used) | ❌ No |

## Customer Billing Portal

Users can manage their subscription through Stripe's Customer Portal:

**Accessible at**: `/dashboard/subscriptions` → "Manage Subscription" button

**What customers can do**:
- Update payment method
- Change plan (upgrade/downgrade)
- Cancel subscription
- View billing history
- Download invoices

## Testing Scenarios

### Test Successful Subscription
1. Go to `/pricing`
2. Click any "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Should see "Active" badge in `/dashboard/subscriptions`

### Test Failed Payment
1. Use test card: `4000 0000 0000 0341`
2. Payment should fail
3. Check dashboard shows payment alert

## Troubleshooting

### "Unauthorized" on checkout
- Make sure user is signed in first
- Checkout requires authenticated session

### Webhook not receiving events
1. Check `STRIPE_WEBHOOK_SECRET` is set
2. In local dev, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. In production, webhook endpoint: `https://your-domain.com/api/stripe/webhook`

### Plan name not matching
The system matches by name (case-insensitive):
- "Essentials" → Essentials plan (5 cards)
- "Stress Free" → Stress Free plan (12 cards)
- "Concierge" → Concierge plan (25 cards)

Make sure your Stripe product names match exactly.

### Card limits not enforcing
Check `lib/api/cron/create-orders/route.ts`:
- Reads `teams.planName`
- Maps to card limits
- Only counts `cardType='subscription'` orders

## Production Deployment

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create live products** (same as test products)
3. **Update environment variables** with live keys:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS=price_live_...
   NEXT_PUBLIC_STRIPE_PRICE_STRESS_FREE=price_live_...
   NEXT_PUBLIC_STRIPE_PRICE_CONCIERGE=price_live_...
   ```
4. **Configure webhook** in Stripe Dashboard:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `customer.subscription.updated`, `customer.subscription.deleted`
5. **Deploy to Vercel**

---

**Need help?** Check Stripe docs: https://stripe.com/docs/billing/subscriptions/overview

