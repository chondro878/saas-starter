# Environment Variables Setup

## Beta Testing Configuration (Current State)

Your site is now configured for **private beta testing** with your designer friends! 🎨

### What's Been Implemented:

1. ✅ **Invite Code System** - Prevents random signups
2. ✅ **Payment Disabling** - Stripe payments can be turned off in production
3. ✅ **Beta Banner** - Shows visitors the site is in development

---

## Required Environment Variables

### Beta Settings (For Designer Feedback)

```bash
# Shows beta banner at top of site
NEXT_PUBLIC_SHOW_BETA_BANNER=true

# Invite code for new signups (prevents random people from signing up)
# Your custom code: AVOIDPUDDLE#42069!
INVITE_CODE=AVOIDPUDDLE#42069!

# Set to 'false' to disable Stripe payments during beta
STRIPE_PAYMENTS_ENABLED=false
```

### Database

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/avoidtherain
```

### Supabase Auth

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Stripe Payment Settings

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Email Settings (Resend)

```bash
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@avoidtherain.com
```

### Address Validation (USPS)

```bash
USPS_USERNAME=your_usps_username
USPS_PASSWORD=your_usps_password
USPS_CLIENT_ID=your_usps_client_id
USPS_CLIENT_SECRET=your_usps_client_secret
```

### App Settings

```bash
BASE_URL=https://avoidtherain.com  # or http://localhost:3000 for local
NODE_ENV=production  # or development for local
```

### Admin Access Control

```bash
# Fulfillment dashboard access (comma-separated email addresses)
# Only these emails can access /dashboard/fulfillment
ADMIN_EMAILS=jesipetrey@gmail.com,hello@juliangarcia.com
```

---

## Configuration for Different Environments

### 🎨 Production Beta (Designer Feedback) - **CURRENT SETUP**

**In Vercel Environment Variables:**

```bash
NEXT_PUBLIC_SHOW_BETA_BANNER=true
INVITE_CODE=AVOIDPUDDLE#42069!
STRIPE_PAYMENTS_ENABLED=false
BASE_URL=https://avoidtherain.com
```

**What this does:**
- ✅ Shows beta banner to all visitors
- ✅ Requires invite code for new signups
- ✅ Disables all Stripe payment processing
- ✅ Existing users can still sign in normally
- ✅ Your designers can sign up with the code and explore

---

### 💻 Local Development

**In your `.env.local` file:**

```bash
NEXT_PUBLIC_SHOW_BETA_BANNER=false
INVITE_CODE=AVOIDPUDDLE#42069!
STRIPE_PAYMENTS_ENABLED=true
BASE_URL=http://localhost:3000
NODE_ENV=development
```

**What this does:**
- ✅ No beta banner (cleaner UI for development)
- ✅ Payments work locally for testing
- ✅ Still requires invite code (keep it consistent)

---

### 🚀 Production Launch (When Ready)

**In Vercel Environment Variables:**

```bash
NEXT_PUBLIC_SHOW_BETA_BANNER=false
STRIPE_PAYMENTS_ENABLED=true
BASE_URL=https://avoidtherain.com
```

**What this does:**
- ✅ Removes beta banner
- ✅ Enables payments
- ✅ Open signups (or keep INVITE_CODE if you want to control growth)

---

## How to Set Up in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the variables for **Production Beta** (see above)
4. Click **Save**
5. Go to **Deployments** → click **...** on latest deployment → **Redeploy**

---

## Testing the Invite Code System

### As a New User:
1. Visit your site (e.g., avoidtherain.com)
2. Click "Sign Up" or "Get Started"
3. Enter email → Click "Continue"
4. You'll see: **"Enter your invite code"** screen
5. Enter: `AVOIDPUDDLE#42069!`
6. Complete signup with name and password
7. ✅ Account created!

### As an Existing User:
1. Visit your site
2. Click "Sign In"
3. Enter email → Click "Continue"
4. Enter password → Sign in normally
5. ✅ No invite code required!

---

## Sharing with Your Designers

**Send them this message:**

> Hey! I'd love your feedback on the site I'm building. 
> 
> 🔗 Site: https://avoidtherain.com  
> 🎟️ Invite Code: `AVOIDPUDDLE#42069!`
> 
> Please sign up and explore! Note that payments are disabled during beta, so you can't actually purchase anything yet - I just want feedback on the design and user experience.
> 
> Thanks! 🙏

---

## FAQ

### Can people still order during beta?
**No.** With `STRIPE_PAYMENTS_ENABLED=false`, all checkout attempts will fail with an error message: *"Payments are currently disabled. Please try again later."*

### Will existing users be affected?
**No.** Existing users can sign in normally. The invite code is only required for **new signups**.

### How do I change the invite code?
Update the `INVITE_CODE` environment variable in Vercel and redeploy.

### How do I remove the beta restrictions?
Set:
- `NEXT_PUBLIC_SHOW_BETA_BANNER=false`
- `STRIPE_PAYMENTS_ENABLED=true`
- Optionally remove `INVITE_CODE`

Then redeploy in Vercel.

---

## Need Help?

If you have questions or run into issues, check:
- Vercel deployment logs
- Browser console for errors
- Server logs in Vercel Functions tab

---

**You're all set! 🚀**

