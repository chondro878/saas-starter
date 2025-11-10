import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import { InteractivePricing } from './interactive-pricing';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <>
      {/* Sticky Navbar */}
      <header className="bg-gray-900 text-white sticky top-0 z-40 w-full border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
          <Link href="/" className="text-2xl font-light">Avoid the Rain</Link>
          <Link 
            href="/sign-in" 
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section - Full Bleed */}
      <section className="w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-20">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight text-gray-900">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Never forget a birthday, anniversary, or special moment again. 
            Premium cards delivered to your door, pre-stamped and ready to send.
          </p>
        </div>
      </section>

      {/* Interactive Pricing Component */}
      <InteractivePricing />

      {/* Add-ons Section - Full Bleed Gray */}
      <section className="w-full bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-light text-center mb-12 text-gray-900">Add-Ons & Extras</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-medium mb-2 text-gray-900">Holiday Bulk Pack</h3>
              <p className="text-4xl font-light mb-4 text-gray-900">$39<span className="text-base text-gray-500">/pack</span></p>
              <p className="text-gray-600 leading-relaxed">15 premium holiday cards, stamped and ready to send</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-medium mb-2 text-gray-900">Extra Cards</h3>
              <p className="text-4xl font-light mb-4 text-gray-900">$9<span className="text-base text-gray-500">/card</span></p>
              <p className="text-gray-600 leading-relaxed">Need an extra card? Add individual cards anytime</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-medium mb-2 text-gray-900">Rush Delivery</h3>
              <p className="text-4xl font-light mb-4 text-gray-900">$10<span className="text-base text-gray-500">/card</span></p>
              <p className="text-gray-600 leading-relaxed">Need it faster? Get 2-day priority shipping</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Full Bleed White */}
      <section className="w-full bg-white py-20">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl font-light text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-medium mb-3 text-gray-900">Can I change plans?</h3>
              <p className="text-gray-600 leading-relaxed">Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
            </div>
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-medium mb-3 text-gray-900">What if I don't use all my cards?</h3>
              <p className="text-gray-600 leading-relaxed">Unused cards roll over to the next year, so you'll never lose what you paid for.</p>
            </div>
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-medium mb-3 text-gray-900">Can I cancel anytime?</h3>
              <p className="text-gray-600 leading-relaxed">Absolutely. Cancel anytime with no penalties. You'll retain access through the end of your billing period.</p>
            </div>
            <div className="pb-8">
              <h3 className="text-xl font-medium mb-3 text-gray-900">Do you offer gift subscriptions?</h3>
              <p className="text-gray-600 leading-relaxed">Yes! Gift subscriptions are perfect for busy friends and family. Contact us for special gift pricing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Bleed Dark */}
      <section className="w-full bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-8 text-center text-white">
          <h2 className="text-5xl font-light mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands who never miss a special moment. Subscribe today.
          </p>
          <Link 
            href="/sign-up" 
            className="inline-block border-2 border-white text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-gray-900 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
