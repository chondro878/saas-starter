'use client';

import { useState } from 'react';
import { checkoutAction } from '@/lib/payments/actions';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  priceId: string;
}

export function InteractivePricing() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const tiers: PricingTier[] = [
    {
      name: 'JUST A FEW',
      price: '$49',
      description: '5 cards/year - for the key people and moments',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS!,
    },
    {
      name: 'KEEP IN TOUCH',
      price: '$99',
      description: '12 cards/year - stay connected without the mental load',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STRESS_FREE!,
    },
    {
      name: 'LET US HELP',
      price: '$199',
      description: '25 cards/year + AI-written messages. For managers or social pros.',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONCIERGE!,
    },
  ];

  const handleCheckout = async (priceId: string) => {
    setIsLoading(priceId);
    try {
      await checkoutAction(priceId);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(null);
    }
  };

  return (
    <section className="w-full relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
      </div>
      
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">
        {tiers.map((tier, index) => (
          <button
            key={tier.priceId}
            onClick={() => handleCheckout(tier.priceId)}
            disabled={isLoading === tier.priceId}
            className={`text-gray-800 p-16 flex flex-col items-center justify-center text-center min-h-[500px] transition-all duration-300 hover:bg-black/5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              index < tiers.length - 1 ? 'border-r border-gray-400/30' : ''
            }`}
          >
            <h3 className="text-sm font-medium tracking-widest uppercase mb-12">
              {tier.name}
            </h3>
            <div className="text-8xl font-light mb-12">
              {isLoading === tier.priceId ? '...' : tier.price}
            </div>
            <p className="text-xl font-light leading-relaxed max-w-xs">
              {tier.description}
            </p>
            {isLoading === tier.priceId && (
              <p className="mt-6 text-sm font-medium animate-pulse">
                Redirecting to checkout...
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

