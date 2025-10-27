'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { Team } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SubscriptionAlert() {
  const { data: team } = useSWR<Team>('/api/team', fetcher);

  if (!team) return null;

  const hasActiveSubscription = team.subscriptionStatus === 'active';
  const needsPayment = !team.subscriptionStatus || team.subscriptionStatus === 'canceled' || team.subscriptionStatus === 'unpaid' || team.subscriptionStatus === 'trialing';
  const hasPaymentIssue = team.subscriptionStatus === 'past_due' || team.subscriptionStatus === 'incomplete';

  // Critical - No subscription
  if (needsPayment) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              ⚠️ Subscription Required to Receive Cards
            </h3>
            <p className="text-red-700 mb-4">
              You don't have an active subscription. Cards won't be automatically sent until you subscribe to a plan.
            </p>
            <Link 
              href="/pricing" 
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Choose a Plan →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Warning - Payment issue
  if (hasPaymentIssue) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Payment Issue Detected
            </h3>
            <p className="text-yellow-700 mb-4">
              There's an issue with your payment method. Please update your billing information to continue receiving cards.
            </p>
            <Link 
              href="/dashboard/subscriptions" 
              className="inline-block bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              Update Payment Method →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success - Active subscription (minimal display)
  if (hasActiveSubscription) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-700">
              <span className="font-semibold">{team.planName || 'Subscription'} active.</span> Your cards will be automatically fulfilled. 
              {' '}<Link href="/dashboard/subscriptions" className="underline hover:text-green-900">View plan details</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

