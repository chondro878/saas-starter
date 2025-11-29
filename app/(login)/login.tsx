'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/app/(dashboard)/components/ui/button';
import { Input } from '@/app/(dashboard)/components/ui/input';
import { Label } from '@/app/(dashboard)/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp, resendVerificationEmail } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { supabase } from '@/lib/supabase/browserClient';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  // Authentication flow state
  const [authStep, setAuthStep] = useState<'email' | 'inviteCode' | 'signin' | 'signup' | 'emailConfirmation'>('email');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [inviteCodeError, setInviteCodeError] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Check if email exists
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.exists) {
        setAuthStep('signin');
      } else {
        // For new users, require invite code
        setAuthStep('inviteCode');
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Validate invite code
  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteCodeError('');
    
    if (inviteCode.trim() === 'AVOIDPUDDLE#42069!') {
      setAuthStep('signup');
    } else {
      setInviteCodeError('Invalid invite code. Please check and try again.');
    }
  };

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback${redirect ? `?redirect=${redirect}` : ''}`,
        },
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsGoogleLoading(false);
    }
  };

  const handleSignInSubmit = (formData: FormData) => {
    formData.set('email', email);
    formAction(formData);
  };

  const handleSignUpSubmit = (formData: FormData) => {
    formData.set('email', email);
    formData.set('firstName', firstName);
    formData.set('lastName', lastName);
    formData.set('inviteCode', inviteCode);
    formAction(formData);
  };

  // Check if email confirmation is required after sign up
  if (state?.success && (state as any)?.requiresEmailConfirmation && authStep !== 'emailConfirmation') {
    setAuthStep('emailConfirmation');
  }

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email || resendingEmail) return;
    
    setResendingEmail(true);
    setResendSuccess(false);
    
    try {
      const formData = new FormData();
      formData.set('email', email);
      
      const result = await resendVerificationEmail({ error: '' } as ActionState, formData);
      
      if (result && 'success' in result && result.success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000); // Clear success message after 5 seconds
      }
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link href="/" className="flex justify-center">
            <h1 className="text-3xl font-light text-gray-800">Avoid the Rain</h1>
          </Link>
        </div>

        {/* White Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 py-10 px-8 shadow-2xl rounded-2xl">
            {authStep === 'email' ? (
              // Step 1: Email Entry
              <>
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">
                  Sign in or create an account
                </h2>
                <p className="text-gray-600 mb-8">Enter your email to get started</p>

                <form className="space-y-6" onSubmit={handleEmailSubmit}>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={254}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors shadow-sm"
                    disabled={isCheckingEmail}
                  >
                    {isCheckingEmail ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Checking...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">or sign in with</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-3 px-4 bg-white/70 hover:bg-white text-gray-700 font-medium rounded-full transition-colors shadow-sm border border-white/60 backdrop-blur-sm flex items-center justify-center gap-3"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600">
                    By continuing, you agree to our{' '}
                    <Link href="#" className="text-indigo-600 hover:text-indigo-500 underline">
                      privacy policy
                    </Link>{' '}
                    and accept our{' '}
                    <Link href="#" className="text-indigo-600 hover:text-indigo-500 underline">
                      terms of service
                    </Link>{' '}
                    and agree to receive newsletters and marketing updates.
                  </p>
                </div>
              </>
            ) : authStep === 'inviteCode' ? (
              // Step 1b: Invite Code (for new signups)
              <>
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">
                  Enter your invite code
                </h2>
                <p className="text-gray-600 mb-8">This site is currently in private beta</p>

                <form className="space-y-6" onSubmit={handleInviteCodeSubmit}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="invite-email" className="block text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <button
                        type="button"
                        onClick={() => setAuthStep('email')}
                        className="text-sm text-indigo-600 hover:text-indigo-500 underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                      {email}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Code
                    </Label>
                    <Input
                      id="inviteCode"
                      name="inviteCode"
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter your invite code"
                    />
                  </div>

                  {inviteCodeError && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{inviteCodeError}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors shadow-sm"
                  >
                    Continue
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an invite code? Contact us to request access.
                    </p>
                  </div>
                </form>
              </>
            ) : authStep === 'signin' ? (
              // Step 2a: Sign In (Password)
              <>
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">
                  Sign in to your Avoid the Rain account
                </h2>

                <form className="space-y-6" action={handleSignInSubmit}>
                  <input type="hidden" name="redirect" value={redirect || ''} />
                  <input type="hidden" name="priceId" value={priceId || ''} />
                  <input type="hidden" name="inviteId" value={inviteId || ''} />

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <button
                        type="button"
                        onClick={() => setAuthStep('email')}
                        className="text-sm text-indigo-600 hover:text-indigo-500 underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                      {email}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signin-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        maxLength={100}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 underline font-medium">
                      Forgot Password?
                    </Link>
                  </div>

                  {state?.error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{state.error}</div>
                  )}

                  {(state as any)?.emailNotConfirmed && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm mb-3">
                        Your email address has not been verified yet. Please check your inbox for the verification link.
                      </p>
                      {resendSuccess ? (
                        <div className="text-green-700 text-sm font-medium">
                          ✓ Verification email sent! Check your inbox.
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendingEmail}
                          className="text-sm text-indigo-600 hover:text-indigo-500 underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendingEmail ? 'Sending...' : 'Resend verification email'}
                        </button>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors shadow-sm"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </>
            ) : authStep === 'emailConfirmation' ? (
              // Email Confirmation Screen
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg 
                      className="w-8 h-8 text-green-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Check your email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a confirmation link to
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-6">
                    <p className="text-gray-900 font-medium">{email}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Next steps:</strong>
                    </p>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Open the email from Avoid the Rain</li>
                      <li>Click the confirmation link</li>
                      <li>You'll be redirected to your dashboard</li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={() => setAuthStep('email')}
                      className="text-indigo-600 hover:text-indigo-500 underline font-medium"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </>
            ) : (
              // Step 2b: Sign Up (Name, Password, Confirm Password)
              <>
                <h2 className="text-3xl font-semibold text-gray-800 mb-8">
                  Create an account
                </h2>

                <form className="space-y-6" action={handleSignUpSubmit}>
                  <input type="hidden" name="redirect" value={redirect || ''} />
                  <input type="hidden" name="priceId" value={priceId || ''} />
                  <input type="hidden" name="inviteId" value={inviteId || ''} />

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <button
                        type="button"
                        onClick={() => setAuthStep('email')}
                        className="text-sm text-indigo-600 hover:text-indigo-500 underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                      {email}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      maxLength={50}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        maxLength={100}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator 
                      password={password} 
                      onValidityChange={setIsPasswordValid}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        maxLength={100}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {password !== confirmPassword && confirmPassword.length > 0 && (
                    <div className="text-red-500 text-sm">Passwords do not match</div>
                  )}

                  {state?.error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{state.error}</div>
                  )}

                  <div className="text-sm text-gray-600">
                    You also confirm that you have read our{' '}
                    <Link href="#" className="text-indigo-600 hover:text-indigo-500 underline">
                      privacy policy
                    </Link>
                    . You have the right to unsubscribe from our newsletters and marketing updates at any time.
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors shadow-sm"
                    disabled={pending || password !== confirmPassword || !isPasswordValid}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Logo at bottom */}
        <div className="mt-8 flex justify-center">
          <span className="text-gray-700 font-medium opacity-60">Avoid the Rain</span>
        </div>
      </div>
    </div>
  );
}
