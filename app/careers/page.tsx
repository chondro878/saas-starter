import Link from 'next/link';
import { Footer } from '@/components/ui/footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers - Avoid the Rain',
  description: 'Want to join the team? We\'re a small operation for now, but who knows what the future holds!',
};

export default function CareersPage() {
  return (
    <>
      <div className="min-h-screen relative overflow-hidden text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60" />
        </div>

        {/* Back Link */}
        <div className="relative">
          <div className="max-w-4xl mx-auto px-6 pt-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-slate-700 hover:text-slate-900 transition-colors font-medium"
            >
              ← Back
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col gap-8 px-6 py-8 sm:py-12 pb-16">
          <div className="space-y-6 rounded-3xl border border-white/60 bg-white/70 p-8 sm:p-12 shadow-2xl backdrop-blur text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Careers at Avoid the Rain</p>
            
            <h1 className="text-5xl sm:text-6xl font-light leading-tight text-gray-900">
              We're Not Hiring
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-6 text-lg leading-relaxed text-slate-700">
              <p>
                Right now, it's just Julian, Jess, and one very opinionated cat running the show. We're licking our own stamps, writing our own code, and answering our own support emails.
              </p>
              
              <p>
                But hey—if you're seeing a careers page here, you'll know we're doing well! 
              </p>
              
              <p className="text-2xl font-light text-purple-600 py-4">
                In the meantime, wish us luck! 
              </p>
              
              <p className="text-base text-slate-600 pt-6">
                If you're curious about what we're building or just want to say hi, we'd love to hear from you.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <a
                href="mailto:hello@avoidtherain.com"
                className="inline-flex items-center justify-center rounded-full bg-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
              >
                Say Hello
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/60 px-8 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
              >
                Learn About Us
              </Link>
            </div>
          </div>

          {/* Fun fact box */}
          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 sm:p-8 shadow-xl backdrop-blur">
            <p className="text-sm font-semibold text-slate-500 mb-3">💡 Fun Fact</p>
            <p className="text-slate-700 leading-relaxed">
              Our cat has attended more "team meetings" (aka lunchtime discussions) than most employees at Fortune 500 companies. Her input is... questionable at best.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


