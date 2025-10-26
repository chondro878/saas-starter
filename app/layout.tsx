import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Avoid the Rain',
  description: 'Luxury greeting cards delivered to your door. Never miss a special occasion again.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-gray-50">
      <body className="min-h-[100dvh] bg-gray-50 text-gray-700 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
