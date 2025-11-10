'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import { InteractivePricing } from './interactive-pricing';
import { getNextHoliday } from '@/lib/occasions';

export default function PricingPage() {
  // Navbar scroll behavior
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100) {
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const nextHoliday = useMemo(() => {
    const holiday = getNextHoliday();
    if (!holiday) return null;
    const today = new Date();
    const timeDiff = holiday.date.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return {
      ...holiday,
      name: holiday.label,
      daysUntil,
    };
  }, []);

  return (
    <>
      {/* Sticky Header */}
      <div className={`fixed top-0 z-50 w-full transition-all duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {nextHoliday && (
          <div className="text-white text-center py-2 text-sm font-medium bg-gray-900">
            Only {nextHoliday.daysUntil} days until {nextHoliday.name}
          </div>
        )}
        <div className="bg-gray-900 flex justify-between items-center px-8 py-4">
          <Link href="/" className="text-2xl font-light text-white">Avoid the Rain</Link>
          <div className="flex gap-6 items-center">
            <Link href="/sign-in" className="text-white text-sm hover:text-white/80 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="border-2 border-white text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-white hover:text-gray-900 transition-colors">Get Started</Link>
          </div>
        </div>
      </div>

      {/* Hero Section - Full Bleed */}
      <section className="w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 pt-32 pb-20">
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

      {/* Add-ons Section - Full Bleed with Gradient */}
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-light text-center mb-12 text-gray-900">Add-Ons & Extras</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-medium mb-2 text-gray-900">Holiday Bulk Pack</h3>
              <p className="text-4xl font-light mb-4 text-gray-900">$39<span className="text-base text-gray-500">/pack</span></p>
              <p className="text-gray-600 leading-relaxed">15 premium holiday cards, stamped and ready to send</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all">
              <h3 className="text-2xl font-medium mb-2 text-gray-900">Extra Cards</h3>
              <p className="text-4xl font-light mb-4 text-gray-900">$9<span className="text-base text-gray-500">/card</span></p>
              <p className="text-gray-600 leading-relaxed">Need an extra card? Add individual cards anytime</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all">
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

      {/* CTA Section - Full Bleed with Gradient */}
      <section className="w-full relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-light mb-6 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands who never miss a special moment. Subscribe today.
          </p>
          <Link 
            href="/sign-up" 
            className="inline-block border-2 border-gray-900 text-gray-900 px-10 py-4 rounded-lg text-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
