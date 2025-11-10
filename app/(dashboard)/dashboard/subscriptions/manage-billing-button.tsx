'use client';

import { useState } from 'react';
import { manageBillingAction } from '@/lib/payments/actions';
import { Settings, Edit } from 'lucide-react';

interface ManageBillingButtonProps {
  variant?: 'primary' | 'secondary' | 'link';
  text?: string;
}

export function ManageBillingButton({ variant = 'primary', text }: ManageBillingButtonProps) {
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

  if (variant === 'link') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Edit className="w-4 h-4" />
        {isLoading ? 'Opening...' : (text || 'Manage Billing')}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Settings className="w-4 h-4" />
        {isLoading ? 'Opening...' : (text || 'Manage Billing')}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Settings className="w-4 h-4" />
      {isLoading ? 'Opening...' : (text || 'Manage subscription')}
    </button>
  );
}

