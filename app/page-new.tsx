"use client";
import { useEffect, useState } from "react";
import { getNextHoliday } from "@/lib/occasions";
import { useMemo } from "react";
import Image from 'next/image';
import Link from "next/link";
import { supabase } from "@/lib/supabase/browserClient";
import { HolidayCarousel } from "./(dashboard)/components/holiday-carousel";
import { Smartphone, Heart, Calendar, Sparkles } from 'lucide-react';

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
    { text: "Beautifully designed cards with zero effort.", source: "anonymous" },
    { text: "No more panic shopping - Unreal!", source: "Emily R." },
    { text: "Such a self confidence booster - thank you!", source: "Grace T." },
    { text: "Such an effortless way to stay connected.", source: "Tyler M." },
    { text: "I love how easy it is to never forget a birthday.", source: "Grace L." },
    { text: "I've been wanting something like this for years!", source: "Andrew T." },
    { text: "This service is a game-changer for relationships.", source: "Mark T." },
    { text: "This has helped my self confidence so much!", source: "Jon P" },
    { text: "A no-brainer. Seriously, just sign up...", source: "Sophie H." },
    { text: "The quality of the cards - OMFG!!!", source: "Don R." },
    { text: "It. just. works. I'm hooked!", source: "Alex J." },
    { text: "So smooth, so simple, so smart!", source: "Vanessa K." },
    { text: "My mom cried when she got her card.", source: "Diego C." },
    { text: "I've never felt more organized.", source: "Jordan F." },
    { text: "Seriously, a priceless service", source: "Shawn P." },
    { text: "No more lame Hallmark cards - FINALLY!", source: "Doug F." },
    { text: "The quality is next level", source: "Sheila E." },
    { text: "Finally, a way to automate being thoughtful.", source: "Nina W." }
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

  return (
    <>
      {/* Sticky Header */}
      <div className={`fixed top-0 z-50 w-full transition-all duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {nextHoliday && (
          <div className="text-white text-center py-2 text-sm font-medium bg-gray-800">
            Only {nextHoliday.daysUntil} days until {nextHoliday.name}!
          </div>
        )}
        <div className="bg-transparent flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-light text-white">Avoid the Rain</h1>
          <div className="flex gap-6 items-center">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  aria-label="Account menu"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{userEmail}</p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Dashboard
                    </Link>
                    <Link href="/pricing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Pricing
                    </Link>
                    <Link href="/dashboard/friendsandfamily" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Settings
                    </Link>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/pricing" className="text-white text-sm hover:text-white/80 transition-colors">Pricing</a>
                <Link href="/sign-up" className="bg-white text-gray-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="relative w-screen h-screen overflow-hidden">
        <Image
          src="/hero.png"
          alt="Hero background image"
          fill
          style={{ objectFit: "cover" }}
          priority
          quality={90}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-start justify-end px-12 pb-32">
          <h1 className="text-white text-6xl font-light mb-6 leading-tight">
            Never again miss <span 
              className={`inline-block transition-opacity duration-500 ${isOccasionFading ? 'opacity-0' : 'opacity-100'}`}
              style={{ minWidth: '280px' }}
            >
              {occasions[currentOccasionIndex]}
            </span>
          </h1>
          <p className="text-white text-xl mb-12 max-w-2xl leading-relaxed">
            Personalized luxury cards arrive just in time for holidays and milestones. You sign, send, and stay connected without the mental load.
          </p>
          {!isAuthenticated && (
            <div className="flex items-center gap-4 flex-nowrap w-full max-w-lg mb-6">
              <Link 
                href="/pricing" 
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-base font-medium whitespace-nowrap hover:bg-gray-100 transition-colors"
              >
                View Pricing
              </Link>
              <Link 
                href="/sign-up" 
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-base font-medium whitespace-nowrap hover:bg-white/20 transition-colors border border-white/30"
              >
                Sign Up Free
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/dashboard" 
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-base font-medium whitespace-nowrap hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link 
                href="/create-reminder" 
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-base font-medium whitespace-nowrap hover:bg-white/20 transition-colors border border-white/30"
              >
                Create Reminder
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Main Content Container */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-16 space-y-12">
          
          {/* Holiday Carousel Section */}
          <HolidayCarousel 
            holidayIndex={0}
            showBuyButton={true}
            showCreditButton={false}
          />

          {/* Testimonials Section */}
          <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 rounded-2xl p-12">
            <div className="text-center">
              <div className="overflow-hidden relative h-40 transition-all duration-500 ease-in-out">
                <div className="animate-fade-slide" key={quoteIndex}>
                  <blockquote className="text-4xl italic font-light text-gray-900 leading-relaxed">
                    '{quotes[quoteIndex].text}'
                  </blockquote>
                  <p className="mt-6 text-lg text-gray-600">- {quotes[quoteIndex].source}</p>
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
          </div>

          {/* Features Grid */}
          <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-normal text-gray-900 mb-2">Why Avoid the Rain?</h2>
              <p className="text-gray-600">
                Everything you need to never miss a special moment
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Never Forget</h3>
                <p className="text-gray-600">
                  Automatic reminders for every birthday, anniversary, and holiday. Set it once, never miss again.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  Hand-curated luxury cards delivered to your door, pre-stamped and ready to sign.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Stay Connected</h3>
                <p className="text-gray-600">
                  Strengthen relationships effortlessly. Show you care without the mental load.
                </p>
              </div>
            </div>
          </div>

          {/* Large iOS Download Banner */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-12">
              {/* Icon/Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center">
                  <Smartphone className="w-16 h-16 text-gray-900" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-light mb-4">
                  Take Us Everywhere
                </h2>
                <p className="text-xl text-gray-300 mb-6 max-w-2xl">
                  Download our iOS app to manage your card reminders on the go. Add recipients, track shipments, and never miss a moment – all from your pocket.
                </p>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <div className="bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-3">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="text-lg">Download on the App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Ready to Never Miss Another Moment?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands who've made staying connected effortless. Start free today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/sign-up" 
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-4 rounded-full text-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Start Free Today
              </Link>
              <Link 
                href="/pricing" 
                className="bg-white text-gray-900 px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors shadow-md border-2 border-gray-900"
              >
                View Pricing
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

