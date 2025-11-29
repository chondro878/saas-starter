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
      description: '25 cards/year + hand-curated messages by real people. For managers or social pros.',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONCIERGE!,
    },
  ];

  const isRecommended = (index: number) => index === 1; // Middle tier gets gold styling

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
      
      {/* Header Text */}
      <div className="relative pt-32 pb-12 px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-light mb-6 text-gray-800 leading-tight">
          Choose your plan
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed">
          Never forget a birthday, anniversary, or Valentine's Day again.
        </p>
      </div>
      
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">
        {tiers.map((tier, index) => (
          <button
            key={tier.priceId}
            onClick={() => handleCheckout(tier.priceId)}
            disabled={isLoading === tier.priceId}
            className={`p-16 flex flex-col items-center justify-center text-center min-h-[500px] transition-all duration-300 hover:shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              index < tiers.length - 1 ? 'border-r border-gray-400/30' : ''
            } ${
              isRecommended(index) ? 'text-yellow-700' : 'text-gray-800'
            }`}
          >
            <h3 className="text-sm font-medium tracking-widest uppercase mb-12">
              {tier.name}
            </h3>
            <div className={`text-8xl font-light mb-12 ${
              isRecommended(index) ? 'text-yellow-600' : ''
            }`}>
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

