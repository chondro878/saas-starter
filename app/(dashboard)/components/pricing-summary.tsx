'use client';

import Link from 'next/link';

export function PricingSummary() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Essentials */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-16 flex flex-col items-center justify-center text-center min-h-[500px] border-r border-white/20">
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
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-16 flex flex-col items-center justify-center text-center min-h-[500px] border-r border-white/20">
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
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
          <h3 className="text-sm font-medium tracking-widest uppercase mb-12">
            LET US HELP
          </h3>
          <div className="text-8xl font-light mb-12">
            $199
          </div>
          <p className="text-xl font-light leading-relaxed max-w-xs">
            25 cards/year + AI-written messages. For managers or social pros.
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

