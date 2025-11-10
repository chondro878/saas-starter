"use client";
import { useEffect, useState } from "react";
import { getNextHoliday } from "@/lib/occasions";
import { useMemo } from "react";
import Image from 'next/image';
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";
import { HolidayCarousel } from "@/app/(dashboard)/components/holiday-carousel";
import { AllCardsCarousel } from "@/app/(dashboard)/components/all-cards-carousel";
import { IOSDownload } from "@/app/(dashboard)/components/ios-download";
import { Footer } from "@/components/ui/footer";

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
    { text: "This legit saved my relationship", source: "Doug B." },
    { text: "Beautifully designed cards with zero effort", source: "anonymous" },
    { text: "No more panic shopping - Unreal!", source: "Emily R." },
    { text: "Such a self confidence booster", source: "Grace T." },
    { text: "Finally, a way to automate being thoughtful", source: "Nina W." }
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // FAQ collapsible state
  const [isFAQOpen, setIsFAQOpen] = useState(false);

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
    }, 6000);
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

  return (
    <>
      {/* Sticky Header */}
      <div className={`fixed top-0 z-50 w-full transition-all duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {nextHoliday && (
          <div className="text-white text-center py-2 text-sm font-medium bg-gray-900">
            Only {nextHoliday.daysUntil} days until {nextHoliday.name}
          </div>
        )}
        <div className="bg-transparent flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-light text-white">Avoid the Rain</h1>
          <div className="flex gap-6 items-center">
            <Link href="/sign-in" className="text-white text-sm hover:text-white/80 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="bg-white text-gray-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Get Started</Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative w-screen h-screen overflow-hidden">
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
            Premium cards delivered to your door, pre-stamped and ready to send.
          </p>
          <Link 
            href="/sign-up" 
            className="bg-white text-gray-900 px-10 py-4 rounded-lg text-lg font-medium whitespace-nowrap hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Social Proof (Quotes) */}
      <section className="w-full bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <div className="overflow-hidden relative h-32 transition-all duration-500 ease-in-out">
            <div className="animate-fade-slide" key={quoteIndex}>
              <blockquote className="text-3xl md:text-4xl italic font-light text-gray-900 leading-relaxed">
                "{quotes[quoteIndex].text}"
              </blockquote>
              <p className="mt-6 text-lg text-gray-600">— {quotes[quoteIndex].source}</p>
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

      {/* Never Miss a Moment */}
      <section className="w-full bg-white py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light mb-8 text-gray-900 leading-tight">
            Never miss a moment
          </h2>
          <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
            Start with your first reminder. Free to try.
          </p>
          <Link 
            href="/sign-up" 
            className="inline-block bg-gray-900 text-white px-12 py-5 rounded-lg text-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Add Your People */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative h-[600px]">
            <Image
              src="/howitworks/1phonelist.jpg"
              alt="Add recipients"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-16 py-20 bg-white">
            <h2 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
              Add your people
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
              Tell us who matters. We'll handle the rest.
            </p>
            <Link 
              href="/sign-up" 
              className="bg-gray-900 text-white px-8 py-4 rounded-lg w-fit hover:bg-gray-800 transition-colors font-medium text-lg"
            >
              Start Now
            </Link>
          </div>
        </div>
      </section>

      {/* Bulk Holiday Cards */}
      <section className="w-full bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative h-[600px]">
            <Image
              src="/holidaystack.png"
              alt="Holiday card stack"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-16 py-20">
            <h2 className="text-5xl font-light mb-6 leading-tight">
              Need bulk cards?
            </h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
              Send holiday cards to everyone at once. We'll handle the stamps, addresses, and delivery.
            </p>
            <Link 
              href="/sign-up" 
              className="bg-white text-gray-900 px-8 py-4 rounded-lg w-fit hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Next Holiday Carousel */}
      <section className="w-full bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <HolidayCarousel 
            holidayIndex={1}
            showBuyButton={false}
            showManageButton={false}
          />
        </div>
      </section>

      {/* FAQ Section - Collapsible */}
      <section className="w-full bg-white py-32">
        <div className="max-w-4xl mx-auto px-8">
          <button
            onClick={() => setIsFAQOpen(!isFAQOpen)}
            className="w-full flex items-center justify-between mb-8 group"
          >
            <h2 className="text-5xl font-light text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className={`transform transition-transform duration-300 ${isFAQOpen ? 'rotate-180' : ''}`}>
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {isFAQOpen && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-medium mb-3 text-gray-900">
                  How does it work?
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Simply add your important people and their special occasions. We'll send you beautifully designed cards 
                  15 days before each event—pre-stamped, pre-addressed, and ready to sign and send.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-3 text-gray-900">
                  What occasions can I track?
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Birthdays, anniversaries, holidays, and any special occasion you don't want to miss. 
                  Add custom occasions and we'll remember them for you.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-3 text-gray-900">
                  How much does it cost?
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Plans start at just $19/year. All cards include premium quality paper, professional printing, 
                  postage stamps, and delivery directly to your door.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-medium mb-3 text-gray-900">
                  Can I customize my cards?
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Yes! Add personal notes and reminders that we'll print inside each card. 
                  Choose from our curated collection of designs for every occasion.
                </p>
              </div>
            </div>
          )}
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
                Download Our iOS App
              </h2>
              <p className="text-xl text-gray-300 mb-6 font-light leading-relaxed">
                Manage your card reminders on the go with our mobile app
              </p>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <div className="bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-3 text-lg shadow-lg">
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

      <Footer />
    </>
  );
}
