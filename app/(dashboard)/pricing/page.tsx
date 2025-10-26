import Link from 'next/link';
import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <>
      {/* Sticky Navbar */}
      <header className="bg-black text-white sticky top-0 z-40 w-full border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-5">
          <Link href="/" className="text-2xl font-light">Avoid the Rain</Link>
          <Link 
            href="/sign-in" 
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="bg-black text-white w-full min-h-screen">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight text-white">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            Never forget a birthday, anniversary, or special moment again. 
            Premium cards delivered to your door, pre-stamped and ready to send.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <PricingCard
              name="Essentials"
              tagline="For close family"
              price={4900}
              interval="year"
              features={[
                '5 cards per year',
                'Premium card designs',
                'Pre-stamped & addressed',
                'Delivered to your door',
                'Email reminders',
              ]}
              priceId="price_essentials"
              recommended={false}
            />
            <PricingCard
              name="Stress Free"
              tagline="Most Popular"
              price={9900}
              interval="year"
              features={[
                '12 cards per year',
                'Premium card designs',
                'Pre-stamped & addressed',
                'Delivered to your door',
                'Email reminders',
                'Holiday pack options',
                'Priority support',
              ]}
              priceId="price_stressfree"
              recommended={true}
            />
            <PricingCard
              name="Concierge"
              tagline="Full service"
              price={19900}
              interval="year"
              features={[
                '25 cards per year',
                'Premium card designs',
                'Pre-stamped & addressed',
                'Delivered to your door',
                'Email reminders',
                'Holiday packs included',
                'AI-written messages',
                'Priority support',
                'Expedited shipping',
              ]}
              priceId="price_concierge"
              recommended={false}
            />
          </div>

          {/* Add-ons Section */}
          <div className="border-t border-gray-800 pt-16">
            <h2 className="text-3xl font-light text-center mb-12 text-white">Add-Ons & Extras</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                <h3 className="text-xl font-medium mb-2 text-white">Holiday Bulk Pack</h3>
                <p className="text-3xl font-light mb-4 text-white">$39<span className="text-base text-gray-400">/pack</span></p>
                <p className="text-gray-400 text-sm">15 premium holiday cards, stamped and ready to send</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                <h3 className="text-xl font-medium mb-2 text-white">Extra Cards</h3>
                <p className="text-3xl font-light mb-4 text-white">$9<span className="text-base text-gray-400">/card</span></p>
                <p className="text-gray-400 text-sm">Need an extra card? Add individual cards anytime</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                <h3 className="text-xl font-medium mb-2 text-white">Rush Delivery</h3>
                <p className="text-3xl font-light mb-4 text-white">$10<span className="text-base text-gray-400">/card</span></p>
                <p className="text-gray-400 text-sm">Need it faster? Get 2-day priority shipping</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="border-t border-gray-800 pt-16 mt-16">
            <h2 className="text-3xl font-light text-center mb-12 text-white">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-gray-800 pb-6">
                <h3 className="text-lg font-medium mb-2 text-white">Can I change plans?</h3>
                <p className="text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
              </div>
              <div className="border-b border-gray-800 pb-6">
                <h3 className="text-lg font-medium mb-2 text-white">What if I don't use all my cards?</h3>
                <p className="text-gray-400">Unused cards roll over to the next year, so you'll never lose what you paid for.</p>
              </div>
              <div className="border-b border-gray-800 pb-6">
                <h3 className="text-lg font-medium mb-2 text-white">Can I cancel anytime?</h3>
                <p className="text-gray-400">Absolutely. Cancel anytime with no penalties. You'll retain access through the end of your billing period.</p>
              </div>
              <div className="pb-6">
                <h3 className="text-lg font-medium mb-2 text-white">Do you offer gift subscriptions?</h3>
                <p className="text-gray-400">Yes! Gift subscriptions are perfect for busy friends and family. Contact us for special gift pricing.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">© 2025 Avoid the Rain. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">Home</Link>
              <Link href="/pricing" className="text-gray-500 hover:text-white text-sm transition-colors">Pricing</Link>
              <Link href="/sign-in" className="text-gray-500 hover:text-white text-sm transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function PricingCard({
  name,
  tagline,
  price,
  interval,
  features,
  priceId,
  recommended,
}: {
  name: string;
  tagline: string;
  price: number;
  interval: string;
  features: string[];
  priceId?: string;
  recommended: boolean;
}) {
  return (
    <div className={`relative rounded-lg overflow-hidden transition-all ${
      recommended 
        ? 'bg-white text-black shadow-2xl scale-105 border-2 border-white' 
        : 'bg-gray-900 text-white border border-gray-800 hover:border-gray-700'
    }`}>
      {recommended && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold uppercase tracking-wide py-2 px-4 text-center">
          {tagline}
        </div>
      )}
      <div className="p-8">
        {!recommended && tagline && (
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{tagline}</p>
        )}
        <h2 className="text-2xl font-medium mb-6">{name}</h2>
        <div className="mb-8">
          <span className="text-5xl font-light">${price / 100}</span>
          <span className={`text-base ml-2 ${recommended ? 'text-gray-600' : 'text-gray-400'}`}>
            / {interval}
          </span>
        </div>
        <Link
          href="/sign-up"
          className={`block w-full py-4 px-6 rounded-lg text-center font-medium transition-all mb-8 ${
            recommended
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          Get Started
        </Link>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                recommended ? 'text-green-600' : 'text-green-400'
              }`} />
              <span className={recommended ? 'text-gray-700' : 'text-gray-300'}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
