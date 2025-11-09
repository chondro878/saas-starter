"use client";
import { useEffect, useState } from "react";
import { getNextHoliday } from "@/lib/occasions";
import { useMemo } from "react";
import Image from 'next/image';
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";
import { HolidayCarousel } from "@/app/(dashboard)/components/holiday-carousel";
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
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/HeroBanner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-start justify-end px-12 pb-32 z-10">
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

      {/* Large Split - Image & Content */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative h-[600px]">
            <Image
              src="/howitworks/1phonelist.jpg"
              alt="Add recipients"
              fill
              style={{ objectFit: "cover" }}
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

      {/* Holiday Carousel 1 */}
      <section className="w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <HolidayCarousel 
            holidayIndex={0}
            showBuyButton={false}
            showManageButton={false}
          />
        </div>
      </section>

      {/* Large Split - Content & Image */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="flex flex-col justify-center px-16 py-20 bg-white">
            <h2 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
              We send the cards
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
              Premium quality. Perfect timing. Every time.
            </p>
            <Link 
              href="/sign-up" 
              className="bg-gray-900 text-white px-8 py-4 rounded-lg w-fit hover:bg-gray-800 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>
          </div>
          <div className="relative h-[600px]">
            <Image
              src="/howitworks/3cardrecived.jpg"
              alt="Receive cards"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Holiday Carousel 2 */}
      <section className="w-full bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <HolidayCarousel 
            holidayIndex={1}
            showBuyButton={false}
            showManageButton={false}
          />
        </div>
      </section>

      {/* Large Split - Image & Content */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative h-[600px]">
            <Image
              src="/howitworks/4mailbox.jpg"
              alt="Send cards"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="flex flex-col justify-center px-16 py-20 bg-white">
            <h2 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
              You sign & send
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-light">
              Pre-stamped. Pre-addressed. Zero stress.
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

      {/* Holiday Carousel 3 */}
      <section className="w-full bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <HolidayCarousel 
            holidayIndex={2}
            showBuyButton={false}
            showManageButton={false}
          />
        </div>
      </section>

      {/* Full Bleed Bulk Holiday Cards Section */}
      <section className="w-full bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-0">
          <div className="relative h-[600px]">
            <Image
              src="/holidaystack.png"
              alt="Holiday card stack"
              fill
              style={{ objectFit: "cover" }}
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

      {/* Social Proof - Full Bleed */}
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
        `}</style>
      </section>

      {/* Final CTA - Full Bleed */}
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

      <Footer />
    </>
  );
}
