import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const code = requestUrl.searchParams.get('code');

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/route.ts:10',message:'Auth callback entry',data:{type,has_token_hash:!!token_hash,has_token:!!token,has_code:!!code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

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
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/route.ts:27',message:'PKCE exchange result',data:{hasError:!!error,errorMsg:error?.message,hasSession:!!data?.session,userEmail:data?.user?.email,emailVerified:data?.user?.email_confirmed_at},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3,H5'})}).catch(()=>{});
    // #endregion
    
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'callback/route.ts:70',message:'Verification failed - redirecting to error',data:{had_code:!!code,had_token_hash:!!token_hash},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

  // Redirect to error page if verification failed
  console.log('[AUTH CALLBACK] Redirecting to auth error page');
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-error`);
}
