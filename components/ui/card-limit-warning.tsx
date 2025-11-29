'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardAllocation, formatCurrency, calculateCardCost } from '@/lib/card-allocation';
import { useRouter } from 'next/navigation';

interface CardLimitWarningProps {
  allocation: CardAllocation;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function CardLimitWarning({ allocation, onDismiss, showDismiss = false }: CardLimitWarningProps) {
  const router = useRouter();

  if (!allocation.isOverLimit) {
    return null;
  }

  const handleBuyCards = () => {
    router.push('/dashboard/subscriptions');
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const cardCost = calculateCardCost(allocation.shortfall);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            You need more cards to cover all your occasions
          </h3>
          <p className="text-gray-700 mb-4">
            You've scheduled {allocation.scheduledCards} card{allocation.scheduledCards !== 1 ? 's' : ''} but your current plan only includes {allocation.totalAvailable} card{allocation.totalAvailable !== 1 ? 's' : ''} per year.
          </p>

          {/* Breakdown */}
          <div className="bg-white rounded-md p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cards scheduled:</span>
              <span className="font-semibold text-gray-900">{allocation.scheduledCards}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your plan includes:</span>
              <span className="font-semibold text-gray-900">{allocation.subscriptionCards}</span>
            </div>
            {allocation.extraCards > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Extra cards:</span>
                <span className="font-semibold text-gray-900">{allocation.extraCards}</span>
              </div>
            )}
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total available:</span>
              <span className="font-semibold text-gray-900">{allocation.totalAvailable}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span className="font-semibold">Cards still needed:</span>
              <span className="font-bold">{allocation.shortfall}</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Options to ensure all cards are sent:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={handleBuyCards}
                className="flex flex-col items-start p-4 bg-white border-2 border-purple-300 hover:border-purple-500 rounded-lg transition-all text-left"
              >
                <span className="font-semibold text-gray-900 mb-1">Buy {allocation.shortfall} card{allocation.shortfall !== 1 ? 's' : ''}</span>
                <span className="text-sm text-gray-600">{formatCurrency(cardCost)} one-time purchase</span>
              </button>
              <button
                onClick={handleUpgrade}
                className="flex flex-col items-start p-4 bg-white border-2 border-purple-300 hover:border-purple-500 rounded-lg transition-all text-left"
              >
                <span className="font-semibold text-gray-900 mb-1">Upgrade plan</span>
                <span className="text-sm text-gray-600">Get up to 25 cards per year</span>
              </button>
            </div>
          </div>

          {showDismiss && onDismiss && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <button
                onClick={onDismiss}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                I'll handle this later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

