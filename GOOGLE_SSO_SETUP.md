# Google SSO Setup Guide

## Overview
Google Single Sign-On (SSO) has been integrated into your login pages using Supabase Auth. Follow these steps to complete the setup.

## Step 1: Configure Google OAuth in Supabase

### 1.1 Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: "Avoid the Rain"
   - User support email: your email
   - Developer contact: your email
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Avoid the Rain Web"
   - Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (for local development)

7. Save your **Client ID** and **Client Secret**

### 1.2 Configure Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. Enable Google provider
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

### 1.3 Update Google OAuth Authorized Redirect URIs

Go back to Google Cloud Console and add your production domain:
- `https://yourdomain.com/auth/callback`
- Your Supabase callback URL (from the Supabase provider config)

## Step 2: Environment Variables

Make sure your `.env.local` file has these Supabase variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 3: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/sign-in`
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected to the dashboard

## How It Works

### Sign In Flow:
1. User clicks "Sign in with Google"
2. User is redirected to Google's OAuth consent screen
3. After consent, Google redirects to `/auth/callback?code=...`
4. The callback route exchanges the code for a session
5. User data is saved to your database
6. User is redirected to dashboard

### User Data Extraction:
- **First Name**: Extracted from `user_metadata.given_name` or `user_metadata.name`
- **Last Name**: Extracted from `user_metadata.family_name` or `user_metadata.name`
- **Email**: Primary email from Google account

### Database Integration:
- New OAuth users are automatically created in your `users` table
- A team is created for each new user
- The user is added as an owner of their team
- OAuth users have an empty `passwordHash` field

## Troubleshooting

### "OAuth failed" error
- Check that your Google Client ID and Secret are correct in Supabase
- Verify redirect URIs match exactly in Google Console
- Check Supabase logs for detailed error messages

### User not created in database
- Check the server logs for errors in `/auth/callback/route.ts`
- Verify database connection is working
- Check that the `users` table schema includes `firstName` and `lastName` fields

### Redirect loop
- Clear your browser cookies
- Check that the callback URL is correct
- Verify Supabase session is being set properly

## Additional Configuration

### Custom Scopes (Optional)
If you need additional Google profile information, you can add scopes:

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'email profile', // Add more scopes as needed
  },
});
```

### Production Considerations
1. Add your production domain to Google OAuth authorized redirect URIs
2. Update Supabase site URL in project settings
3. Test the flow on staging before production
4. Monitor OAuth logs in both Google and Supabase

## Support
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)

