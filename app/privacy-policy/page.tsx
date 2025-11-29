import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Avoid the Rain',
  description: 'Learn how Avoid the Rain collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-light text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-12">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                  At Avoid the Rain, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Information We Collect</h2>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Recipient information (names, addresses, and occasion dates)</li>
                  <li>Communication preferences and account settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Process and fulfill your card orders</li>
                  <li>Send reminder emails for upcoming occasions</li>
                  <li>Process payments and maintain your subscription</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Improve our products and services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Service Providers:</strong> Including payment processors (Stripe), shipping partners (USPS), and email service providers</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or acquisition</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Cancel your subscription at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to improve your experience, analyze usage, and assist with our marketing efforts. You can control cookies through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Email:</strong> <a href="mailto:privacy@avoidtherain.com" className="text-purple-600 hover:text-purple-700">privacy@avoidtherain.com</a>
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
