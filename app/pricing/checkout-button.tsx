'use client';

import { useState } from 'react';
import { checkoutAction } from '@/lib/payments/actions';

interface CheckoutButtonProps {
  priceId: string;
  recommended?: boolean;
  children: React.ReactNode;
}

export function CheckoutButton({ priceId, recommended, children }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await checkoutAction(priceId);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`block w-full py-4 px-6 rounded-lg text-center font-medium transition-all mb-8 disabled:opacity-50 disabled:cursor-not-allowed ${
        recommended
          ? 'bg-white text-purple-600 hover:bg-gray-100'
          : 'bg-gray-900 text-white hover:bg-gray-800'
      }`}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
}

