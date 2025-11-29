'use client';

import { useState } from 'react';
import { manageBillingAction } from '@/lib/payments/actions';

interface UpgradeButtonProps {
  priceId: string;
  planName: string;
}

export function UpgradeButton({ priceId, planName }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Open billing portal where they can upgrade
      await manageBillingAction();
    } catch (error) {
      console.error('Error opening billing portal:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Opening...' : `Upgrade to ${planName}`}
    </button>
  );
}

