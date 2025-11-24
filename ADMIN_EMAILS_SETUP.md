# Quick Setup: Admin Emails for Fulfillment Dashboard

## 🎯 What You Need To Do

Add this environment variable to allow access to the fulfillment dashboard.

---

## Local Development

**File**: `.env.local` (create it if it doesn't exist)

Add this line:

```bash
ADMIN_EMAILS=jesipetrey@gmail.com,hello@juliangarcia.com
```

**Then restart your dev server:**

```bash
# Stop the server (Ctrl+C)
# Then start it again:
npm run dev
```

---

## Production (Vercel)

### Step 1: Add Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Key**: `ADMIN_EMAILS`
   - **Value**: `jesipetrey@gmail.com,hello@juliangarcia.com`
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **...** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## Testing

### ✅ As Authorized User

Login with `jesipetrey@gmail.com` or `hello@juliangarcia.com`:

1. You should see "Fulfillment Dashboard" in the sidebar
2. Clicking it should load the fulfillment page
3. You can print orders and mark them as sent

### ❌ As Unauthorized User

Login with any other email (e.g., `test@test.com`):

1. "Fulfillment Dashboard" should NOT appear in sidebar
2. If you try to visit `/dashboard/fulfillment` directly, you'll be redirected to `/dashboard`

---

## Adding More Admins Later

Just edit the `ADMIN_EMAILS` value and add more emails separated by commas:

```bash
ADMIN_EMAILS=jesipetrey@gmail.com,hello@juliangarcia.com,newadmin@example.com
```

**Important**: No spaces between emails!

---

## ⚠️ Important Notes

- Emails are case-sensitive
- No spaces around commas
- Must match the exact email the user signs up with
- Changes require server restart (local) or redeploy (production)

---

✅ **You're done!** The fulfillment dashboard is now secured to only you and Jess.

