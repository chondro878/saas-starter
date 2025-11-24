'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AttachReminderPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-data'>('loading');
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    async function attachReminder() {
      try {
        // Get pending reminder from localStorage
        const pendingDataStr = localStorage.getItem('pendingReminder');
        
        if (!pendingDataStr) {
          console.log('[ATTACH] No pending reminder found');
          setStatus('no-data');
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
        }

        const pendingData = JSON.parse(pendingDataStr);
        
        // Store recipient name for display
        setRecipientName(`${pendingData.recipient.firstName} ${pendingData.recipient.lastName}`);

        console.log('[ATTACH] Processing pending reminder');

        // Call API to create the reminder
        const response = await fetch('/api/pending-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendingData }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('[ATTACH] API error:', errorData);
          throw new Error(errorData.error || 'Failed to attach reminder');
        }

        const result = await response.json();
        console.log('[ATTACH] Success:', result);

        // Clear localStorage
        localStorage.removeItem('pendingReminder');

        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/friendsandfamily');
        }, 2000);
      } catch (error) {
        console.error('[ATTACH] Error:', error);
        setStatus('error');
        
        // Still redirect after a delay, but to general dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    }

    attachReminder();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Setting up your reminder{recipientName && ` for ${recipientName}`}...
            </h2>
            <p className="text-gray-600">This will only take a moment</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              All set! 🎉
            </h2>
            <p className="text-gray-600">
              Your reminder for {recipientName} has been created!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to your dashboard...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-2">
              We couldn't attach your reminder automatically.
            </p>
            <p className="text-sm text-gray-500">
              Don't worry, you can add it from the dashboard.
            </p>
          </>
        )}

        {status === 'no-data' && (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-3xl">👋</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome!
            </h2>
            <p className="text-gray-600">
              Redirecting to your dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

