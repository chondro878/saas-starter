'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, CreditCard } from 'lucide-react';
import { purchaseCardCreditAction } from '@/lib/payments/actions';
import { Team } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CardCreditPurchase() {
  const { data: team } = useSWR<Team>('/api/team', fetcher);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await purchaseCardCreditAction();
    } catch (error) {
      console.error('Error purchasing card credit:', error);
      setIsLoading(false);
    }
  };

  const cardCredits = team?.cardCredits || 0;

  return (
    <section className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 rounded-2xl p-6 sm:p-8 mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left side - Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900">Cards Remaing</h2>
          </div>
          <p className="text-base sm:text-lg text-gray-700 mb-2">
            You have <span className="font-semibold text-purple-700">{cardCredits}</span> extra card{cardCredits !== 1 ? 's' : ''} available
          </p>
          <p className="text-sm text-gray-600">
            Need another card? We got you covered!
          </p>
        </div>

        {/* Right side - Purchase Button */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-base sm:text-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {isLoading ? 'Processing...' : 'Add a Card'}
          </button>
        </div>
      </div>

      {/* Optional: Show pricing details */}
      <div className="mt-6 pt-6 border-t border-purple-200">
        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>$9 per card</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>Perfect for last-minute occasions or spontaneous kindness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>Save on bulk card purchases vs buying individually</span>
          </div>
        </div>
      </div>
    </section>
  );
}

