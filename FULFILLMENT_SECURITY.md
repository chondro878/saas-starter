# Fulfillment Dashboard Security

## Overview

The fulfillment dashboard at `/dashboard/fulfillment` is now protected with role-based access control. Only authorized admin users can access this sensitive area where orders are printed, labeled, and marked as sent.

---

## Access Control

### Who Can Access?

Access is granted to users who meet **either** of these criteria:

1. **Role-based**: User has `role = 'owner'` in the database
2. **Email whitelist**: User's email is in the `ADMIN_EMAILS` environment variable

### Current Authorized Emails

```
jesipetrey@gmail.com
hello@juliangarcia.com
```

---

## Implementation Details

### Security Check Location

**File**: `/app/(dashboard)/dashboard/fulfillment/page.tsx`

The security check runs at the server-side page level before any order data is loaded:

```typescript
export default async function FulfillmentPage() {
  // ===== SECURITY CHECK =====
  const user = await getUser();
  
  // Whitelist of admin emails who can access fulfillment
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAuthorized = 
    user?.role === 'owner' || 
    adminEmails.includes(user?.email || '');
  
  if (!isAuthorized) {
    redirect('/dashboard');
  }
  // ===== END SECURITY CHECK =====
  
  // ... rest of fulfillment logic
}
```

### Navigation Menu

**File**: `/app/(dashboard)/dashboard/layout.tsx`

The "Fulfillment Dashboard" navigation item is already configured to only show for owners:

```typescript
const navItems = [
  // ... other items
  { href: '/dashboard/fulfillment', icon: Printer, label: 'Fulfillment Dashboard', adminOnly: true },
];

// Later in the component:
if (item.adminOnly && user?.role !== 'owner') {
  return null; // Hide menu item
}
```

### Environment Configuration

**File**: `.env.local` (local) or Vercel Environment Variables (production)

```bash
# Fulfillment dashboard access (comma-separated email addresses)
ADMIN_EMAILS=jesipetrey@gmail.com,hello@juliangarcia.com
```

---

## How It Works

### For Authorized Users

1. User logs in with `jesipetrey@gmail.com` or `hello@juliangarcia.com`
2. "Fulfillment Dashboard" appears in their sidebar navigation
3. They can access `/dashboard/fulfillment` directly
4. Full access to print orders, labels, and mark as sent

### For Unauthorized Users

1. User logs in with any other email (e.g., `test@test.com`)
2. "Fulfillment Dashboard" does **not** appear in sidebar
3. If they try to access `/dashboard/fulfillment` directly via URL:
   - Server-side check catches them
   - They are immediately redirected to `/dashboard`
   - No order data is loaded or exposed

### For Unauthenticated Users

1. User is not logged in
2. If they try to access `/dashboard/fulfillment`:
   - Middleware catches them before page loads
   - They are redirected to `/sign-in`

---

## Security Layers

This implementation has **three layers** of security:

### Layer 1: Middleware (Authentication)
- **File**: `/middleware.ts`
- **Purpose**: Ensures user is logged in
- **Action**: Redirects to `/sign-in` if not authenticated

### Layer 2: UI Visibility (UX)
- **File**: `/app/(dashboard)/dashboard/layout.tsx`
- **Purpose**: Hides menu item from unauthorized users
- **Action**: Menu item only shows if `user.role === 'owner'`

### Layer 3: Server-Side Authorization (Security)
- **File**: `/app/(dashboard)/dashboard/fulfillment/page.tsx`
- **Purpose**: Prevents direct URL access by unauthorized users
- **Action**: Redirects to `/dashboard` if not authorized

**Note**: Layers 1 and 2 are UX conveniences. **Layer 3 is the critical security layer** and cannot be bypassed.

---

## Adding/Removing Admin Access

### Option 1: Add to Email Whitelist

**Best for**: Julian and Jess (current owners)

**In Vercel:**
1. Go to **Settings** → **Environment Variables**
2. Edit `ADMIN_EMAILS`
3. Add new email: `jesipetrey@gmail.com,hello@juliangarcia.com,newadmin@example.com`
4. Save and redeploy

**Locally:**
Add to `.env.local`:
```bash
ADMIN_EMAILS=jesipetrey@gmail.com,hello@juliangarcia.com,newadmin@example.com
```

### Option 2: Update User Role in Database

**Best for**: Future employees or contractors who need permanent access

**SQL Command:**
```sql
UPDATE users 
SET role = 'owner' 
WHERE email = 'employee@example.com';
```

**Or use a database migration** for more permanent role changes.

---

## Testing

### Test as Authorized User

1. Login as `jesipetrey@gmail.com` or `hello@juliangarcia.com`
2. Check sidebar → "Fulfillment Dashboard" should be visible
3. Navigate to `/dashboard/fulfillment` → Should load successfully
4. Verify you can see pending orders

### Test as Unauthorized User

1. Login as `test@test.com` (or any other user)
2. Check sidebar → "Fulfillment Dashboard" should **not** be visible
3. Manually navigate to `http://localhost:3000/dashboard/fulfillment`
4. Should immediately redirect to `/dashboard`
5. Check browser console → No order data should be loaded

### Test as Unauthenticated User

1. Log out completely
2. Navigate to `/dashboard/fulfillment`
3. Should redirect to `/sign-in`

---

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] `ADMIN_EMAILS` is set in Vercel Environment Variables
- [ ] Emails are comma-separated with no spaces: `email1@domain.com,email2@domain.com`
- [ ] Test with both authorized and unauthorized accounts
- [ ] Verify menu item visibility
- [ ] Verify direct URL access is blocked
- [ ] Check Vercel deployment logs for any errors

---

## Troubleshooting

### "I can't see the Fulfillment Dashboard menu item"

**Check:**
1. Are you logged in as `jesipetrey@gmail.com` or `hello@juliangarcia.com`?
2. Is `ADMIN_EMAILS` set correctly in your environment?
3. Clear browser cache and refresh

### "I can access fulfillment but my co-admin can't"

**Check:**
1. Is their email exactly as typed in `ADMIN_EMAILS`?
2. Are there any extra spaces in the environment variable?
3. Did you redeploy after adding the email?

### "Regular users can still see the menu item"

**This is expected** if their database `role` is set to `'owner'`. This is by design - owners always have access regardless of email whitelist.

To fix: Update their role to `'member'` in the database.

---

## Future Enhancements

### Granular Permissions

If you hire fulfillment staff who should only:
- Print orders (but not mark as sent)
- View history (but not print)

Consider implementing a more granular permission system:

```typescript
// Example future schema
export const users = pgTable('users', {
  // ...
  permissions: jsonb('permissions').default({
    canPrintOrders: false,
    canMarkOrdersSent: false,
    canViewOrderHistory: false,
  }),
});
```

### Audit Logging

For compliance and accountability, consider logging:
- Who accessed the fulfillment dashboard
- Who printed which orders
- Who marked orders as sent
- When these actions occurred

This can be added to the existing `activityLogs` table.

### Separate Fulfillment App

If you scale to 5+ fulfillment staff, consider:
- Separate subdomain: `fulfillment.avoidtherain.com`
- Dedicated Next.js app with limited scope
- Stricter authentication (2FA, IP whitelist)
- Shared database but isolated access patterns

---

## Security Best Practices

✅ **Do:**
- Always use environment variables for sensitive configuration
- Test security with unauthorized accounts
- Keep the email whitelist up to date
- Remove access immediately when someone leaves the team

❌ **Don't:**
- Hardcode email addresses in the application code
- Share admin credentials with third parties
- Give fulfillment access to customers or external contractors
- Expose order data in client-side components

---

**Questions?** This security implementation follows industry best practices for role-based access control (RBAC) and should be suitable for production use.

