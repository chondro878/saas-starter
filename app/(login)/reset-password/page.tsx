'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/browserClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Check if we have a valid session/token on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if this is a password recovery session
      if (session) {
        setIsValidToken(true);
      } else {
        // No session means invalid or expired token
        setIsValidToken(false);
      }
    };

    checkSession();
  }, [supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Update the password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.push('/sign-in?message=password-reset-success');
      }, 2000);

    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50">
          <div className="text-center">
            <div className="mb-4 text-red-600">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/sign-in">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50">
          <div className="text-center">
            <div className="mb-4 text-green-600">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated. Redirecting you to sign in...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300 p-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
      
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <Label htmlFor="password" className="text-gray-900 font-medium">
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
              className="mt-2 bg-white/50 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              className="mt-2 bg-white/50 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-base font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

