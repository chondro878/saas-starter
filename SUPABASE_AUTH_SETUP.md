# Supabase Authentication Setup

## Overview
This application uses Supabase for authentication with proper session persistence via cookies using `@supabase/ssr`.

## Required Environment Variables

Add these to your `.env` or `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project dashboard under Settings > API.

## Architecture

### Server-Side Authentication (`lib/supabase/server.ts`)
- Uses `createServerClient` from `@supabase/ssr`
- Handles cookies synchronously (required by Supabase SSR)
- Used in Server Components, Route Handlers, and Server Actions

### Client-Side Authentication (`lib/supabase/browserClient.ts`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Implements proper `document.cookie` handling
- Used in Client Components

### Middleware (`middleware.ts`)
- Refreshes Supabase session on every request
- Protects `/dashboard` routes
- Redirects authenticated users away from auth pages
- Properly sets cookies in both request and response

## Session Flow

1. **Sign In**: User credentials → Supabase Auth → Session stored in cookies
2. **Page Refresh**: Middleware reads cookies → Validates session → Refreshes if needed
3. **Protected Routes**: Middleware checks authentication → Redirects if not authenticated
4. **Sign Out**: Clears Supabase session and cookies

## Key Features

✅ **Session Persistence**: Sessions persist across page refreshes via HTTP-only cookies
✅ **Automatic Refresh**: Middleware automatically refreshes expired sessions
✅ **No Login Loop**: Proper redirect handling prevents infinite loops
✅ **Secure**: Uses HTTP-only, secure cookies with proper SameSite settings
✅ **Modern**: Uses only `@supabase/ssr` (no deprecated packages)

## Testing Checklist

- [ ] Sign in works and redirects to dashboard
- [ ] Refresh page - should stay logged in
- [ ] Close browser and reopen - should stay logged in
- [ ] Sign out clears session properly
- [ ] Protected routes redirect to sign-in when not authenticated
- [ ] Auth pages redirect to dashboard when already authenticated

## Common Issues

### Login Loop
**Cause**: Middleware redirecting endlessly
**Fix**: Ensure middleware has proper user check and redirect logic (already implemented)

### Session Not Persisting
**Cause**: Incorrect cookie handling
**Fix**: Verify cookie handlers in server and browser clients match Supabase SSR requirements (already implemented)

### "Can't find user" after refresh
**Cause**: getUser() not using Supabase session
**Fix**: Ensure getUser() retrieves user from Supabase auth (already implemented)

## Files Updated

- ✅ `lib/supabase/server.ts` - Server-side Supabase client
- ✅ `lib/supabase/browserClient.ts` - Client-side Supabase client
- ✅ `lib/auth/session.ts` - Session utilities using Supabase
- ✅ `lib/db/queries.ts` - getUser() using Supabase
- ✅ `middleware.ts` - Middleware using Supabase SSR
- ✅ `app/(login)/actions.ts` - Sign in/out using Supabase
- ✅ `package.json` - Removed deprecated auth-helpers packages

## Dependencies

```json
{
  "@supabase/ssr": "^0.7.0",
  "@supabase/supabase-js": "^2.57.4"
}
```

## No Longer Used (Removed)

- ❌ `@supabase/auth-helpers-nextjs` - Deprecated
- ❌ `@supabase/auth-helpers-react` - Deprecated
- ❌ `components/SupabaseProvider.tsx` - Not needed with SSR
- ❌ `lib/supabase.ts` - Replaced by server.ts and browserClient.ts
- ❌ Custom session tokens - Using Supabase sessions only

