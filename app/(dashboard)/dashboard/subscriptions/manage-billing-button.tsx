'use client';

import { useState } from 'react';
import { manageBillingAction } from '@/lib/payments/actions';
import { Settings } from 'lucide-react';

interface ManageBillingButtonProps {
  variant?: 'primary' | 'secondary';
}

export function ManageBillingButton({ variant = 'primary' }: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await manageBillingAction();
    } catch (error) {
      console.error('Error opening billing portal:', error);
      setIsLoading(false);
    }
  };

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Settings className="w-4 h-4" />
        {isLoading ? 'Opening...' : 'Manage Billing'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Settings className="w-5 h-5" />
      {isLoading ? 'Opening Portal...' : 'Manage Subscription'}
    </button>
  );
}

