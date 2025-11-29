import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Avoid the Rain',
  description: 'Terms and conditions for using Avoid the Rain services.',
};

export default function TermsOfServicePage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Back Link */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              ← Back
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-sm text-gray-500 mb-12">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using Avoid the Rain ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  Avoid the Rain is a subscription-based service that sends premium greeting cards to you before important occasions. We provide reminder services, card printing, pre-stamping, and delivery to your specified address.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Subscription Terms</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Billing</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Subscriptions are billed annually in advance</li>
                  <li>Payment is processed through Stripe, our secure payment processor</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>You authorize us to charge your payment method for all subscription fees</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Card Allocation</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Your plan includes a specific number of cards per year</li>
                  <li>Unused cards do not roll over to the next subscription period</li>
                  <li>Our "Just Because" feature may automatically use unused cards</li>
                  <li>Additional cards can be purchased separately</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Cancellation</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellations take effect at the end of your current billing period</li>
                  <li>No refunds are provided for partial subscription periods</li>
                  <li>You retain access to your account until the end of the paid period</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">User Responsibilities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and complete information</li>
                  <li>Keep your account credentials secure</li>
                  <li>Maintain accurate recipient addresses</li>
                  <li>Notify us of any address changes at least 3 weeks before scheduled deliveries</li>
                  <li>Use the Service only for lawful purposes</li>
                  <li>Not violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Delivery and Timing</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Cards are typically delivered 2-3 weeks before the occasion date</li>
                  <li>We are not responsible for delays caused by USPS or other carriers</li>
                  <li>You are responsible for mailing cards to recipients after receiving them</li>
                  <li>Delivery addresses must be valid US addresses</li>
                  <li>We cannot guarantee delivery dates for occasions less than 15 days away</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed">
                  All card designs, website content, and branding are the property of Avoid the Rain. You may not reproduce, distribute, or create derivative works without our explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To the maximum extent permitted by law:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>We are not liable for any indirect, incidental, or consequential damages</li>
                  <li>Our total liability is limited to the amount you paid in the past 12 months</li>
                  <li>We are not responsible for missed occasions due to user error or postal delays</li>
                  <li>We provide the Service "as is" without warranties of any kind</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Modifications to Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify or discontinue the Service at any time. We will provide reasonable notice of any material changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Dispute Resolution</h2>
                <p className="text-gray-700 leading-relaxed">
                  Any disputes arising from these Terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. These Terms are governed by the laws of Washington State.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-700 leading-relaxed">
                  Questions about these Terms of Service? Contact us at:
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Email:</strong> <a href="mailto:support@avoidtherain.com" className="text-purple-600 hover:text-purple-700">support@avoidtherain.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
