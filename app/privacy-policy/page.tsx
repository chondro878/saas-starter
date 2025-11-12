import Link from 'next/link';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'We collect the information you provide when you create an account, make a purchase, or contact support. This may include your name, email address, mailing address, payment details, and any preferences you share with us.',
      'We also collect technical information automatically, such as IP address, browser type, device identifiers, and usage data to help us improve performance and reliability.'
    ]
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'To provide, personalize, and improve our services, including printing and delivering your cards.',
      'To communicate with you about orders, reminders, promotions, and important updates.',
      'To monitor and analyze usage, prevent fraud, ensure security, and comply with legal obligations.'
    ]
  },
  {
    title: '3. Sharing Your Information',
    content: [
      'We share information with trusted service providers who support payment processing, printing, shipping, analytics, and customer service. These partners are required to protect your data and only use it for the services they perform for us.',
      'We may disclose information if required by law, to protect our rights, or to respond to lawful requests from public authorities.'
    ]
  },
  {
    title: '4. Your Choices & Rights',
    content: [
      'You can update your account details, manage marketing preferences, or delete your account at any time from your dashboard or by contacting support.',
      'You may opt out of marketing emails by using the unsubscribe link in any communication or adjusting your notification preferences.'
    ]
  },
  {
    title: '5. Data Retention & Security',
    content: [
      'We retain your information for as long as needed to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.',
      'We maintain administrative, technical, and physical safeguards designed to protect your information. However, no system is completely secure, and we encourage you to use strong passwords and keep your credentials private.'
    ]
  },
  {
    title: '6. Children’s Privacy',
    content: [
      'Our services are not directed to children under 13, and we do not knowingly collect personal information from children. If we learn that we have collected information from a child without parental consent, we will delete it promptly.'
    ]
  },
  {
    title: '7. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the “Last Updated” date below.'
    ]
  },
  {
    title: '8. Contact Us',
    content: [
      'Have questions or requests? Email us at support@avoidtherain.com or write to Avoid the Rain, 123 Evergreen Terrace, Seattle, WA 98101.'
    ]
  }
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-700 text-base sm:text-lg leading-relaxed">
            Your trust matters. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
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
            <h2 className="text-2xl font-semibold text-gray-900">9. Exercising Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              To exercise any privacy rights available in your region, please submit a request through our support channel. We may verify your identity before completing the request to protect your account.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

