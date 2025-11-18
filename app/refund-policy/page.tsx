import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Our refund policy for Avoid the Rain greeting cards. Learn about cancellations, refunds for damaged or lost orders, and how to request help.',
  openGraph: {
    title: 'Refund Policy | Avoid the Rain',
    description: 'Our refund policy for Avoid the Rain greeting cards. Learn about cancellations, refunds for damaged or lost orders.',
    url: 'https://avoidtherain.com/refund-policy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections = [
  {
    title: '1. Overview',
    content: [
      'We stand behind every card we print and ship. This Refund Policy explains when we provide refunds or credits and how to request help if something goes wrong.'
    ]
  },
  {
    title: '2. Cancellations Before Shipment',
    content: [
      'You can cancel any order that has not yet entered production or been handed off for shipping. If no cards have been printed or shipped, we will issue a full refund to your original payment method.'
    ]
  },
  {
    title: '3. Refunds for Unshipped Orders',
    content: [
      'If you subscribed or prepaid for cards but have not scheduled or sent any cards and would like to cancel, we will refund any unused balance in full.',
      'Refunds are generally processed within 5–7 business days, depending on your financial institution.'
    ]
  },
  {
    title: '4. Damaged or Lost in Transit',
    content: [
      'If cards arrive damaged or fail to arrive due to a shipping carrier issue, we will credit your Avoid the Rain account with the full value of the affected cards so you can resend them at no additional cost.',
      'Please notify us within 14 days of the expected delivery date and include photos or documentation so we can file a claim with the carrier.'
    ]
  },
  {
    title: '5. Non-Refundable Situations',
    content: [
      'Because each order is custom printed, we cannot offer refunds for cards that have already shipped unless they were damaged or lost in transit.',
      'We do not refund for spelling mistakes, incorrect addresses, or other user-provided errors once production has started. Please review all details carefully before confirming your order.',
      'Subscriptions that have already delivered scheduled cards are not eligible for partial refunds, but you can cancel future deliveries at any time.'
    ]
  },
  {
    title: '6. How to Request a Refund or Credit',
    content: [
      'Email support@avoidtherain.com with your order number, the names of affected recipients, and a brief description of the issue.',
      'We may ask for additional information to verify the problem. Once confirmed, we will process your refund or credit promptly and keep you updated along the way.'
    ]
  },
  {
    title: '7. Changes to This Policy',
    content: [
      'We may update this Refund Policy as our service evolves. We will post any changes here and update the “Last Updated” date below.'
    ]
  }
];

export default function RefundPolicyPage() {
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
            Refund Policy
          </h1>
          <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            We make things right when cards do not go out as planned. Review our refund rules and how to request help below.
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

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Need Help?</h2>
            <p className="text-gray-700 leading-relaxed">
              Reach out anytime at <a href="mailto:support@avoidtherain.com" className="text-indigo-600 hover:text-indigo-500 underline">support@avoidtherain.com</a>. We’re happy to help you keep every card on track.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

