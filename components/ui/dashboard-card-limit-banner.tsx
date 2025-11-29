'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardCardLimitBannerProps {
  scheduledCards: number;
  availableCards: number;
  shortfall: number;
}

export function DashboardCardLimitBanner({ 
  scheduledCards, 
  availableCards, 
  shortfall 
}: DashboardCardLimitBannerProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  if (shortfall <= 0 || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-shrink-0 mt-1">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              You've scheduled {scheduledCards} cards but only have {availableCards} available
            </h3>
            <p className="text-gray-700 mb-4">
              You'll need {shortfall} more card{shortfall !== 1 ? 's' : ''} to send to everyone on your list.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/dashboard/subscriptions')}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Buy Cards
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

