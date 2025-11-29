'use client';

import Link from 'next/link';

export function PricingSummary() {
  return (
    <section className="w-full relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
      </div>
      
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Essentials */}
        <div className="text-gray-800 p-16 flex flex-col items-center justify-center text-center min-h-[500px] border-r border-gray-400/30">
          <h3 className="text-sm font-medium tracking-widest uppercase mb-12">
            JUST A FEW
          </h3>
          <div className="text-8xl font-light mb-12">
            $49
          </div>
          <p className="text-xl font-light leading-relaxed max-w-xs">
            5 cards/year - for the key people and moments
          </p>
        </div>

        {/* Stress Free */}
        <div className="text-gray-800 p-16 flex flex-col items-center justify-center text-center min-h-[500px] border-r border-gray-400/30">
          <h3 className="text-sm font-medium tracking-widest uppercase mb-12">
            KEEP IN TOUCH
          </h3>
          <div className="text-8xl font-light mb-12">
            $99
          </div>
          <p className="text-xl font-light leading-relaxed max-w-xs">
            12 cards/year - stay connected without the mental load
          </p>
        </div>

        {/* Concierge */}
        <div className="text-gray-800 p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
          <h3 className="text-sm font-medium tracking-widest uppercase mb-12">
            LET US HELP
          </h3>
          <div className="text-8xl font-light mb-12">
            $199
          </div>
          <p className="text-xl font-light leading-relaxed max-w-xs">
            25 cards/year + hand-curated messages by real people. For managers or social pros.
          </p>
        </div>
      </div>
      
      {/* CTA Button */}
      <div className="bg-white flex justify-center py-16">
        <Link 
          href="/pricing" 
          className="bg-gray-900 text-white px-14 py-5 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
        >
          View Full Pricing
        </Link>
      </div>
    </section>
  );
}

