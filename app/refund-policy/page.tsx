import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Avoid the Rain',
  description: 'Learn about our refund and cancellation policy.',
};

export default function RefundPolicyPage() {
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
            <h1 className="text-4xl font-light text-gray-900 mb-4">Refund Policy</h1>
            <p className="text-sm text-gray-500 mb-12">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Our Commitment</h2>
                <p className="text-gray-700 leading-relaxed">
                  At Avoid the Rain, we want you to be completely satisfied with our service. This Refund Policy outlines our approach to refunds, cancellations, and service guarantees.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Subscription Refunds</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">30-Day Money-Back Guarantee</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  New subscribers can request a full refund within 30 days of their initial subscription purchase if:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>No cards have been printed or shipped</li>
                  <li>The request is made within 30 days of the original purchase date</li>
                  <li>You contact us at <a href="mailto:support@avoidtherain.com" className="text-purple-600 hover:text-purple-700">support@avoidtherain.com</a></li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">After 30 Days</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  After the 30-day guarantee period:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Subscriptions are non-refundable</li>
                  <li>You may cancel at any time to prevent future charges</li>
                  <li>You will retain access through the end of your current billing period</li>
                  <li>No partial refunds are provided for unused cards or time remaining</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Card Quality Guarantee</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We stand behind the quality of our cards. If you receive a card that is:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Damaged during shipping</li>
                  <li>Printed with errors or defects</li>
                  <li>Missing components (envelope, stamp, etc.)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We will replace it at no charge. Contact us within 7 days of receiving the card with photos of the issue.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Add-On Purchases</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Extra Cards</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Refundable before printing begins (typically 48 hours after purchase)</li>
                  <li>Non-refundable once printing has started</li>
                  <li>Eligible for replacement if damaged or defective</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Holiday Packs</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Refundable within 14 days if unopened and in original condition</li>
                  <li>Non-refundable once opened or used</li>
                  <li>Return shipping costs are the customer's responsibility</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Delivery Issues</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">Lost or Late Deliveries</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If your cards don't arrive as scheduled:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>Contact us within 7 days of the expected delivery date</li>
                  <li>We will investigate with USPS and provide a replacement if lost</li>
                  <li>We are not responsible for delays caused by USPS or force majeure events</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">Incorrect Address</h3>
                <p className="text-gray-700 leading-relaxed">
                  We are not responsible for cards sent to incorrect addresses provided by you. Please ensure all addresses are accurate and up-to-date in your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Cancellation Process</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To cancel your subscription:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>Log into your account at avoidtherain.com</li>
                  <li>Navigate to Settings → Subscriptions</li>
                  <li>Click "Manage Billing" to access the Stripe portal</li>
                  <li>Select "Cancel Subscription"</li>
                </ol>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Alternatively, email us at <a href="mailto:support@avoidtherain.com" className="text-purple-600 hover:text-purple-700">support@avoidtherain.com</a> and we'll process your cancellation within 24 hours.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Refund Processing</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Approved refunds are processed within 5-7 business days</li>
                  <li>Refunds are issued to the original payment method</li>
                  <li>It may take additional time for your bank to process the refund</li>
                  <li>You will receive an email confirmation once the refund is processed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Exceptions and Special Cases</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We handle each situation with care. If you have extenuating circumstances not covered by this policy, please contact us. We'll do our best to find a fair solution.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Examples of situations we may accommodate:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Medical emergencies or hospitalization</li>
                  <li>Service outages on our end</li>
                  <li>Repeated quality issues with cards</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  For refund requests or questions about this policy:
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Email:</strong> <a href="mailto:support@avoidtherain.com" className="text-purple-600 hover:text-purple-700">support@avoidtherain.com</a><br />
                  <strong>Response Time:</strong> Within 24 hours on business days
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
