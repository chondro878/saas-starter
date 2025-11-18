import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { BetaBanner } from '@/components/ui/beta-banner';

export const metadata: Metadata = {
  metadataBase: new URL('https://avoidtherain.com'),
  title: {
    default: 'Avoid the Rain - Never Miss A Special Occasion',
    template: '%s | Avoid the Rain'
  },
  description: 'Premium greeting cards delivered to your door, pre-stamped and ready to send. Never miss a birthday, anniversary, or holiday again. Simple reminders, luxury cards, zero stress.',
  keywords: ['greeting cards', 'reminder service', 'birthday cards', 'anniversary cards', 'holiday cards', 'luxury cards', 'card subscription', 'thoughtful gifts', 'never forget birthdays', 'automatic reminders'],
  authors: [{ name: 'Avoid the Rain' }],
  creator: 'Avoid the Rain',
  publisher: 'Avoid the Rain',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://avoidtherain.com',
    siteName: 'Avoid the Rain',
    title: 'Avoid the Rain - Never Miss A Special Occasion',
    description: 'Premium greeting cards delivered to your door, pre-stamped and ready to send. Never miss a birthday, anniversary, or holiday again.',
    images: [
      {
        url: '/hero.png',
        width: 1200,
        height: 630,
        alt: 'Avoid the Rain - Luxury Greeting Cards',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avoid the Rain - Never Miss A Special Occasion',
    description: 'Premium greeting cards delivered to your door, pre-stamped and ready to send. Never miss a birthday, anniversary, or holiday again.',
    images: ['/hero.png'],
    creator: '@avoidtherain',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Avoid the Rain',
    url: 'https://avoidtherain.com',
    logo: 'https://avoidtherain.com/hero.png',
    description: 'Premium greeting cards delivered to your door, pre-stamped and ready to send. Never miss a birthday, anniversary, or holiday again.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@avoidtherain.com',
      contactType: 'Customer Service',
      areaServed: 'US',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://twitter.com/avoidtherain',
      'https://instagram.com/avoidtherain'
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Seattle',
      addressRegion: 'WA',
      postalCode: '98101',
      addressCountry: 'US'
    }
  };

  return (
    <html lang="en" className="bg-gray-50">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-[100dvh] bg-gray-50 text-gray-700 antialiased">
        <BetaBanner />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
