"use client";
import { useEffect, useState } from "react";
import { getNextHoliday } from "@/lib/occasions";
import { useMemo } from "react";
import Image from 'next/image';
import Link from "next/link";
import Script from 'next/script';
import { supabase } from "@/lib/supabase/browserClient";
import { HolidayCarousel } from "@/app/(dashboard)/components/holiday-carousel";
import { AllCardsCarousel } from "@/app/(dashboard)/components/all-cards-carousel";
import { InteractivePricing } from "@/app/pricing/interactive-pricing";
import { IOSDownload } from "@/app/(dashboard)/components/ios-download";
import { Footer } from "@/components/ui/footer";
import { MeetOurArtists } from "@/app/(dashboard)/components/meet-our-artists";

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Rotating text for hero section
  const occasions = [
    'a birthday',
    'an anniversary',
    'Valentine\'s Day',
    'Christmas',
    'New Year',
    'Memorial Day',
    'Halloween',
    'Mother\'s Day',
    'Father\'s Day',
    'Easter',
    'Independence Day',
    'Veterans Day',
  ];
  const [currentOccasionIndex, setCurrentOccasionIndex] = useState(0);
  const [isOccasionFading, setIsOccasionFading] = useState(false);

  // Quote rotator state
  const quotes = [
    { text: "This legits saved my relationship - thank you!", source: "Doug B." },
    { text: "Avoid the rain has my back when I forget - Love it!", source: "Joeseph F." },
    { text: "Beautifully designed cards with zero effort", source: "anonymous" },
    { text: "No more panic shopping - Unreal!", source: "Emily R." },
    { text: "Such a self confidence booster", source: "Grace T." },
    { text: "Finally, a way to automate being thoughtful", source: "Nina W." }
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // FAQ individual question states
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});
  
  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        setUserEmail(user?.email || null);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Rotate through occasions with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOccasionFading(true);
      
      setTimeout(() => {
        setCurrentOccasionIndex((prevIndex) => (prevIndex + 1) % occasions.length);
        setIsOccasionFading(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [occasions.length]);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAccountMenu && !target.closest('[aria-label="Account menu"]') && !target.closest('.absolute.right-0')) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);


  // Navbar scroll behavior
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100) {
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const nextHoliday = useMemo(() => {
    const holiday = getNextHoliday();
    if (!holiday) return null;
    const today = new Date();
    const timeDiff = holiday.date.getTime() - today.getTime();
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return {
      ...holiday,
      name: holiday.label,
      daysUntil,
    };
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  // Structured data for SEO
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Avoid the Rain Greeting Card Service',
    description: 'Premium greeting cards delivered to your door, pre-stamped and ready to send. Never miss a birthday, anniversary, or holiday.',
    brand: {
      '@type': 'Brand',
      name: 'Avoid the Rain'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '9',
      highPrice: '149',
      offerCount: '3',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127'
    }
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does it work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply add your important people and their special occasions. We\'ll send you beautifully designed cards from independent artists 15 days before each event; pre-stamped, pre-addressed, and ready to sign and send.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I get to pick the cards?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No and that\'s intentional! We aim to keep you in touch with the people you care about while removing as much of the mental load as possible.'
        }
      },
      {
        '@type': 'Question',
        name: 'Will the cards be appropriate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Always! We design cards for real relationships, no cringey jokes, no corporate vibes, no lazy designs. Just smart, subtle, personal and custom to your relationship.'
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      {/* Skip to main content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gray-900 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      
      {/* Sticky Header */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`} role="banner">
        {nextHoliday && (
          <div className="text-white text-center py-2 text-sm font-medium bg-gray-900" role="complementary" aria-label="Holiday countdown">
            Only {nextHoliday.daysUntil} days until {nextHoliday.name}
          </div>
        )}
        <nav className="bg-transparent flex justify-between items-center px-8 py-4" aria-label="Main navigation">
          <Link href="/" className="text-2xl font-light text-white" aria-label="Avoid the Rain home">
            Avoid the Rain
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/sign-in" className="text-white text-sm hover:text-white/80 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="border-2 border-white text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-white hover:text-gray-900 transition-colors">Sign Up</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main id="main-content" className="relative w-screen h-screen overflow-hidden" role="main">
        <video
          src="/HeroBanner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 flex flex-col items-start justify-end px-12 pb-32 z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <h1 className="text-white text-6xl md:text-7xl font-light mb-6 leading-tight">
            Never again miss <span 
              className={`inline-block transition-opacity duration-500 ${isOccasionFading ? 'opacity-0' : 'opacity-100'}`}
              style={{ minWidth: '280px' }}
            >
              {occasions[currentOccasionIndex]}
            </span>
          </h1>
          <p className="text-white text-xl md:text-2xl mb-12 max-w-2xl leading-relaxed font-light">
           You pick who matters and when. We send you a designer card ahead of time, plus the note you wrote to your future self.
          </p>
          
          {/* Scroll Down Indicator */}
          <button
            onClick={() => {
              const nextSection = document.querySelector('#how-it-works-section');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-7 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-gray-900 transition-all group"
            aria-label="Scroll to start"
          >
            <svg 
              className="w-4 h-4 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-base font-light">Start Now</span>
          </button>
        </div>
      </main>

      {/* How It Works - Header Section */}
      <section id="how-it-works-section" className="w-full relative py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-gray-800 leading-tight">
            Keeping you thoughtful! 
          </h2>
          <p className="text-xl md:text-2xl text-gray-800 font-light leading-relaxed max-w-3xl mx-auto">
          Set it up once. From then on, the right card and the reminder you wrote about them shows up early so you always know what to say and when to say it.<br/>
          </p>
        </div>
      </section>

      {/* Step 3: Receive Card - Video Right (moved, title removed) */}
      <section className="w-full bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative flex items-center justify-center min-h-[525px] md:min-h-[600px] order-1 md:order-2">
            <video
              src="/Step3.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-col justify-center px-8 md:px-20 py-12 md:py-24 order-2 md:order-1">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Your Card Arrives Before You Need It
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
              15 days before the occasion, receive a beautifully designed luxury card, your reminder note, and pre-stamped, pre-addressed envelope.
            </p>
          </div>
        </div>
      </section>

      {/* Step 4: Mail It - Video Left (moved, title removed) */}
      <section className="w-full bg-gradient-to-br from-amber-50 via-yellow-50 to-pink-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative flex items-center justify-center min-h-[525px] md:min-h-[600px] order-1 md:order-1">
            <video
              src="/Step4.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            />
          </div>
          <div className="flex flex-col justify-center px-8 md:px-20 py-12 md:py-24 order-2 md:order-2">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Sign, seal, and send — you're done!
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
              Use your reminder note to curate a message, seal, and drop it in the mailbox and you're done! No stress, no last-minute panic, no forgetting. Just a meaningful gesture that shows you care, delivered on time!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Header Section (duplicated) */}
      <section className="w-full relative py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-gray-800 leading-tight">
            Here's how it works
          </h2>
          <p className="text-xl md:text-2xl text-gray-800 font-light leading-relaxed max-w-3xl mx-auto">
            Set things up once. From then on, the right card and your own reminder message about the person land in your hands exactly when they should.<br/>
          </p>
        </div>
      </section>

      {/* Step 1: Add Your People - Video Left */}
      <section className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="flex flex-col justify-center px-8 md:px-20 py-12 md:py-32 order-1">
            <div className="meta text-gray-500 mb-6">Step 1</div>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Add the people you want to stay close with 
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
              Start by adding the people who matter most - family, friends, colleagues, anyone you want to remember!
            </p>
          </div>
          <div className="relative flex items-center justify-center min-h-[525px] md:min-h-[600px] order-2">
            <video
              src="/Step1.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Step 2: Set Reminders - Video Right */}
      <section className="w-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="flex flex-col justify-center px-8 md:px-20 py-12 md:py-24 order-1 md:order-1">
            <div className="meta text-gray-500 mb-6">Step 2</div>
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Add dates and occasions that matter
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
              Mark their birthdays, anniversaries, or holidays you would like to celebrate - and you're done! We'll keep track of everything so you don't have to remember.
            </p>
          </div>
          <div className="relative flex items-center justify-center min-h-[525px] md:min-h-[600px] order-2 md:order-2">
            <video
              src="/Step2.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* CTA Section (duplicated) */}
      <section className="w-full relative py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-gray-800 leading-tight">
            Never miss a moment
          </h2>
          <p className="text-xl text-gray-800 mb-12 font-light leading-relaxed">
            See how it works for yourself - no obligation! 
          </p>
          <Link 
            href="/create-reminder" 
            className="inline-block border-2 border-gray-800 text-gray-800 px-12 py-5 rounded-lg text-xl font-medium hover:bg-gray-800 hover:text-white transition-colors"
          >
            Try it now! 
          </Link>
        </div>
      </section>

      {/* Meet Our Artists */}
      <MeetOurArtists />

      {/* Social Proof (Quotes) */}
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-32" aria-label="Customer testimonials">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="overflow-hidden relative min-h-[200px] md:min-h-[128px] transition-all duration-500 ease-in-out">
            <div className="animate-fade-slide" key={quoteIndex}>
              <blockquote className="text-2xl sm:text-3xl md:text-4xl italic font-light text-gray-900 leading-relaxed px-2">
                "{quotes[quoteIndex].text}"
              </blockquote>
              <p className="mt-6 text-base sm:text-lg text-gray-600 break-words px-2">— {quotes[quoteIndex].source}</p>
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeSlide {
            0%, 100% { opacity: 0; transform: translateY(10px); }
            10%, 90% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-slide {
            animation: fadeSlide 10s ease-in-out infinite;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </section>

      {/* Browse All Cards Carousel - Full Bleed */}
      <AllCardsCarousel />

      {/* CTA Section */}
      <section className="w-full relative py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-gray-800 leading-tight">
            Never miss a moment
          </h2>
          <p className="text-xl text-gray-800 mb-12 font-light leading-relaxed">
            See how it works for yourself - no obligation! 
          </p>
          <Link 
            href="/create-reminder" 
            className="inline-block border-2 border-gray-800 text-gray-800 px-12 py-5 rounded-lg text-xl font-medium hover:bg-gray-800 hover:text-white transition-colors"
          >
            Try it now! 
          </Link>
        </div>
      </section>

      {/* Bulk Holiday Cards */}
      <section className="w-full bg-gradient-to-br from-slate-100 via-gray-100 to-blue-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative h-[525px] md:h-[600px]">
            <Image
              src="/holidaystack.png"
              alt="Holiday card stack"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-20 py-24">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
              Need bulk cards?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
              Send holiday cards to everyone at once. We'll send you a kit of cards, reminder notes, and envelopes. Holidays - Stress Free!
            </p>
          </div>
        </div>
      </section>

      {/* Next Holiday Carousel */}
      <section className="w-full bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <HolidayCarousel 
            holidayIndex={0}
            showBuyButton={false}
            showCreditButton={false}
          />
        </div>
      </section>

      {/* Pricing Component */}
      <InteractivePricing />

      {/* FAQ Section - Individual Collapsible Questions */}
      <section className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 py-32">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-5xl md:text-6xl font-light text-center mb-16 text-gray-900">
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
                <h3 className="text-2xl font-medium text-gray-900 pr-8">
                  How does it work?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[0] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[0] && (
                <div id="faq-answer-0" className="pb-6 animate-fadeIn">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Simply add your important people and their special occasions. We'll send you beautifully designed cards from independent artists
                    well before each event or holiday; pre-stamped, pre-addressed, and ready to sign and send.
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
                <h3 className="text-2xl font-medium text-gray-900 pr-8">
                  Do I get to pick the cards?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[1] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[1] && (
                <div id="faq-answer-1" className="pb-6 animate-fadeIn">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    No and that's intentional!
                    We aim to keep you in touch with the people you care about while removing as much of the mental load as possible.
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
                <h3 className="text-2xl font-medium text-gray-900 pr-8">
                  Will the cards be appropriate?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[2] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[2] && (
                <div id="faq-answer-2" className="pb-6 animate-fadeIn">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Always! We design cards for real relationships, no cringey jokes, no corporate vibes, no AI slop.
                    Just smart, subtle designs - always!
                  </p>
                </div>
              )}
            </div>

            {/* Question 4 */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full flex items-center justify-between py-6 text-left group"
                aria-expanded={faqOpen[3]}
                aria-controls="faq-answer-3"
              >
                <h3 className="text-2xl font-medium text-gray-900 pr-8">
                When will my cards arrive?
                </h3>
                <div className={`transform transition-transform duration-300 flex-shrink-0 ${faqOpen[3] ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {faqOpen[3] && (
                <div id="faq-answer-3" className="pb-6 animate-fadeIn">
                  <p className="text-lg text-gray-600 leading-relaxed">
                  Cards are shipped to you ~3 weeks before the occasion date. You'll receive them ~2 weeks before the occasion date, giving you plenty of time to personalize and send them. 
                  We'll email you once your card ships so nothing slips through the cracks!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Download the App - Full Bleed */}
      <section className="w-full bg-gradient-to-r from-gray-900 to-gray-700 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-12">
            {/* Icon/Image Placeholder */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-light mb-4 text-white">
                Download our free companion app Nudge
              </h2>
              <p className="text-xl text-gray-300 mb-6 font-light leading-relaxed">
                  Little reminders to be thoughtful to the people close to you. 
                  Not an app you open - one that opens you!
              </p>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-gray-900 transition-colors inline-flex items-center gap-3 text-lg">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Download on the App Store
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started CTA */}
      <section className="w-full relative py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-gray-900 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Join thousands who never miss a special moment. Subscribe today!
          </p>
          <Link 
            href="/sign-up" 
            className="inline-block border-2 border-gray-900 text-gray-900 px-12 py-5 rounded-lg text-xl font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
