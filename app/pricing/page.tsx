'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import { InteractivePricing } from './interactive-pricing';

export default function PricingPage() {
  // FAQ individual question states
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});
  
  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      {/* Interactive Pricing Component */}
      <InteractivePricing />

      {/* Add-ons Section - Full Bleed with Gradient */}
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-light text-center mb-12 text-gray-900">Add-Ons & Extras</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
          </div>
        </div>
      </section>

      {/* FAQ Section - Individual Collapsible Questions */}
      <section className="w-full bg-white py-20">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-12 md:mb-16 text-gray-900">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {/* Question 1 */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={faqOpen[0]}
                aria-controls="faq-answer-0"
              >
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 pr-8">
                  Can I change plans?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[0] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[0] && (
                <div id="faq-answer-0" className="pb-6 animate-fadeIn">
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    Yes! You can change your plan at any time. Changes take effect at your next billing cycle.
                  </p>
                </div>
              )}
            </div>

            {/* Question 2 */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={faqOpen[1]}
                aria-controls="faq-answer-1"
              >
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 pr-8">
                  What if I don't use all my cards?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[1] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[1] && (
                <div id="faq-answer-1" className="pb-6 animate-fadeIn">
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    Unused cards don't roll over, but we've got you covered! You can choose our "Just Because" feature and remind someone you're thinking of them.
                  </p>
                </div>
              )}
            </div>

            {/* Question 3 */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={faqOpen[2]}
                aria-controls="faq-answer-2"
              >
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 pr-8">
                  How does the "Just Because" feature work?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[2] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[2] && (
                <div id="faq-answer-2" className="pb-6 animate-fadeIn">
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    When applied, we send a card out to you, avoiding holidays and the recipiants scheduled occasions. It's a thoughtful way to stay connected!
                  </p>
                </div>
              )}
            </div>

            {/* Question 4 */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleFaq(4)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={faqOpen[4]}
                aria-controls="faq-answer-4"
              >
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 pr-8">
                  Can I cancel anytime?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[4] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[4] && (
                <div id="faq-answer-4" className="pb-6 animate-fadeIn">
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    Absolutely. Cancel anytime with no penalties. You'll retain access through the end of your billing period.
                  </p>
                </div>
              )}
            </div>

            {/* Question 5 */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleFaq(5)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={faqOpen[5]}
                aria-controls="faq-answer-5"
              >
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 pr-8">
                  What card designs do you offer?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[5] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[5] && (
                <div id="faq-answer-5" className="pb-6 animate-fadeIn">
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    We offer premium designs for every occasion - birthdays, anniversaries, holidays, and more. All cards are high-quality, beautifully designed, and ready to make someone's day special.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
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
