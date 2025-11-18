import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Terms of Service for Avoid the Rain. Understand your rights and responsibilities when using our greeting card reminder service.',
  openGraph: {
    title: 'Terms of Service | Avoid the Rain',
    description: 'Read the Terms of Service for Avoid the Rain. Understand your rights and responsibilities when using our service.',
    url: 'https://avoidtherain.com/terms-of-service',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing Avoid the Rain, creating an account, or using any of our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use of the platform.'
    ]
  },
  {
    title: '2. Eligibility',
    content: [
      'You must be at least 18 years old to create an account. By using the service, you represent that you have the legal capacity to enter into a binding agreement.'
    ]
  },
  {
    title: '3. Accounts & Security',
    content: [
      'You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately if you suspect unauthorized access.'
    ]
  },
  {
    title: '4. Orders, Billing & Subscriptions',
    content: [
      'By submitting an order or activating a subscription, you authorize us to charge the payment method on file for the applicable fees and taxes.',
      'Subscription plans renew automatically unless cancelled prior to the renewal date. You can manage your subscription from your dashboard at any time.'
    ]
  },
  {
    title: '5. Cancellations & Refunds',
    content: [
      'You may cancel an order before it enters production. Once production begins, orders are final. For subscription cancellations, access remains active through the end of the billing cycle.',
      'Contact support@avoidtherain.com for assistance with cancellations or questions about refunds.'
    ]
  },
  {
    title: '6. Intellectual Property',
    content: [
      'All creative assets, logos, designs, and software are owned by Avoid the Rain or our licensors. You may not copy, modify, or distribute any part of the service without written permission.',
      'By uploading personalized content (such as card messages or images), you grant us a limited license to use that content solely to fulfill your orders.'
    ]
  },
  {
    title: '7. Acceptable Use',
    content: [
      'You agree not to misuse the service, including uploading offensive, unlawful, or infringing content, attempting to disrupt the platform, or using the service for unauthorized marketing or spam.'
    ]
  },
  {
    title: '8. Disclaimers',
    content: [
      'We strive for uninterrupted availability, but the service is provided on an “as-is” and “as-available” basis. We make no warranties regarding reliability, accuracy, or suitability for a particular purpose.'
    ]
  },
  {
    title: '9. Limitation of Liability',
    content: [
      'To the fullest extent permitted by law, Avoid the Rain is not liable for any indirect, incidental, special, or consequential damages arising from your use of the service.'
    ]
  },
  {
    title: '10. Governing Law',
    content: [
      'These terms are governed by the laws of the State of Washington, without regard to its conflict of law principles.'
    ]
  },
  {
    title: '11. Changes to the Terms',
    content: [
      'We may update these Terms of Service from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.'
    ]
  },
  {
    title: '12. Contact Information',
    content: [
      'Questions? Reach out to us at support@avoidtherain.com or mail us at Avoid the Rain, 123 Evergreen Terrace, Seattle, WA 98101.'
    ]
  }
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60" />
      </div>

      <div className="relative min-h-screen flex flex-col py-16 px-6 sm:px-10 lg:px-16">
        <header className="max-w-4xl mx-auto mb-12">
          <Link href="/" className="text-sm uppercase tracking-[0.3em] text-gray-700 hover:text-gray-900 transition">
            Avoid the Rain
          </Link>
          <h1 className="mt-4 text-4xl sm:text-5xl font-semibold text-gray-900">
            Terms of Service
          </h1>
          <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            These Terms govern your use of Avoid the Rain. Please review them carefully before creating an account or placing an order.
          </p>
          <p className="mt-6 text-sm uppercase tracking-wide text-gray-600">Last updated: November 2025</p>
        </header>

        <main className="max-w-4xl mx-auto bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 sm:p-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
              {section.content.map((paragraph) => (
                <p key={paragraph} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

