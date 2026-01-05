import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const code = requestUrl.searchParams.get('code');

  console.log('[AUTH CALLBACK] Processing verification:', { 
    type, 
    has_token_hash: !!token_hash,
    has_token: !!token,
    has_code: !!code 
  });

  const supabase = await createSupabaseServerClient();

  // Handle PKCE flow (newer Supabase auth)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      console.log('[AUTH CALLBACK] PKCE verification successful for:', data.user?.email);
      
      // Check if user came from create-reminder flow
      const pendingReminder = requestUrl.searchParams.get('from');
      if (pendingReminder === 'create-reminder') {
        console.log('[AUTH CALLBACK] Redirecting to attach-reminder flow');
        return NextResponse.redirect(`${requestUrl.origin}/onboarding/attach-reminder`);
      }

      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
    
    console.error('[AUTH CALLBACK] PKCE verification failed:', error?.message);
  }
  
  // Handle legacy token_hash flow
  else if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error && data.user) {
      console.log('[AUTH CALLBACK] Email verified successfully for:', data.user.email);

      // Check if user came from create-reminder flow
      const pendingReminder = requestUrl.searchParams.get('from');
      if (pendingReminder === 'create-reminder') {
        console.log('[AUTH CALLBACK] Redirecting to attach-reminder flow');
        return NextResponse.redirect(`${requestUrl.origin}/onboarding/attach-reminder`);
      }

      // Redirect to dashboard or specified next page
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    console.error('[AUTH CALLBACK] Verification failed:', error?.message);
  }

  // Redirect to error page if verification failed
  console.log('[AUTH CALLBACK] Redirecting to auth error page');
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error`);
}
