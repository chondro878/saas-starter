/**
 * This is the main home page of your site.
 * 
 * It includes:
 * - A sticky header with a holiday countdown banner and nav
 * - A hero section with background image, headline, email input, and CTA
 * - A carousel preview of card designs
 * - A rotating quote/testimonial section
 * - A teaser for the reminder feature
 * - A FAQ section using the Accordion component
 */
"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { getNextHoliday } from "@/lib/occasions";
import { useMemo } from "react";
import Image from 'next/image';
import Link from "next/link";
import { ReminderForm } from "./components/form/reminder-form";
import SplitTeaser from "./components/ui/split-teaser";
import Newsletter from "./components/ui/newsletter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { supabase } from "@/lib/supabase/browserClient";

// Quotes shown in the rotating testimonial section
export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  // Quote rotator state/hooks
  const quotes = [
    { text: "This legit saved my relationship", source: "Doug B." },
    { text: "Beautifully designed cards with zero effort.", source: "anonymous" },
    { text: "No more panic shopping - Unreal!", source: "Emily R." },
    { text: "Such a self confidence booster - thank you!", source: "Grace T." },
    { text: "Such a effortless way to stay connected.", source: "Tyler M." },
    { text: "I love how easy it is to never forget a birthday.", source: "Grace L." },
    { text: "I've been wanting somethimg like this for years!'", source: "Andrew T." },
    { text: "This service is a game-changer for relationships.", source: "Mark T." },
    { text: "This has helped my self confidence so much!", source: "Jon P" },
    { text: "A no-brainer. Seroiusly, just sign up...", source: "Sophie H." },
    { text: "The quality of the cards - OMFG!!!", source: "Don r." },
    { text: "It. just. works. I’m hooked!", source: "Alex J." },
    { text: "So smooth, so simple, so smart!", source: "Vanessa K." },
    { text: "My mom cried when she got her card.", source: "Diego C." },
    { text: "I’ve never felt more organized.", source: "Jordan F." },
    { text: "Seriously, a pricelss service", source: "Shawn P." },
    { text: "No more lame Halmark cards - FINALLY!", source: "Doug F." },
    { text: "The quality is next level", source: "Sheila E." },
    { text: "Finally, a way to automate being thoughtful.", source: "Nina W." }
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<{ src: string; title: string; price: string } | null>(null);
  const [cardCarouselIndex, setCardCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calculate the next upcoming holiday and how many days until it
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

  // Automatically cycle through quotes every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Image cycling logic for SplitTeaser rightContent
  const images = [
    { src: "/split1.jpg", alt: "Split teaser image 1" },
    { src: "/split2.jpg", alt: "Split teaser image 2" },
    { src: "/split3.jpg", alt: "Split teaser image 3" }
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(imageInterval);
  }, [images.length]);

  const rightContentImage = (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <Image
        src={images[currentImageIndex].src}
        alt={images[currentImageIndex].alt}
        width={600}
        height={400}
        className="object-cover w-full h-full"
      />
    </div>
  );

  // New image carousel for How It Works section
  const howItWorksImages = [
    "/howitworks/1phonelist.jpg",
    "/howitworks/2phonecalendar.jpg",
    "/howitworks/3cardrecived.jpg",
    "/howitworks/4mailbox.jpg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % howItWorksImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Inline image slider logic for SplitTeaser rightContent
  const [currentImageIndexHowItWorks, setCurrentImageIndexHowItWorks] = useState(0);
  const howItWorksSliderImages = [
    '/howitworks/1phonelist.jpg',
    '/howitworks/2phonecalendar.jpg',
    '/howitworks/3cardrecived.jpg',
    '/howitworks/4mailbox.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexHowItWorks((prevIndex) => (prevIndex + 1) % howItWorksSliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Navbar scroll behavior
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100) {
        // Show navbar when near top
        setIsNavbarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // Hide navbar when scrolling down
        setIsNavbarVisible(false);
      } else {
        // Show navbar when scrolling up
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const cards = [
    { src: "/SampleCard1.jpg", title: "Love", price: "$5" },
    { src: "/SampleCard2.jpg", title: "Anniversary", price: "$6" },
    { src: "/SampleCard3.jpg", title: "Just Because", price: "$4" },
    { src: "/SampleCard4.jpg", title: "Congrats!", price: "$3" },
    { src: "/SampleCard5.jpg", title: "Patriotic", price: "$4" },
    { src: "/SampleCard6.jpg", title: "Love", price: "$5" },
    { src: "/SampleCard7.jpg", title: "Happy Birthday", price: "$4" },
    { src: "/SampleCard8.jpg", title: "Congradulation", price: "$3" }
  ];

  // Create infinite loop by tripling the cards array
  const infiniteCards = [...cards, ...cards, ...cards];

  // Carousel navigation with infinite scroll
  const scrollCarousel = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? (cardCarouselIndex - 1 + cards.length) % cards.length
      : (cardCarouselIndex + 1) % cards.length;
    setCardCarouselIndex(newIndex);
  };

  // Handle mouse/touch drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - (carouselRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Auto-scroll to maintain infinite loop effect
  useEffect(() => {
    if (!carouselRef.current) return;
    const cardWidth = carouselRef.current.offsetWidth / 4; // Assuming 4 cards visible
    const targetScroll = (cards.length + cardCarouselIndex) * cardWidth;
    
    carouselRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }, [cardCarouselIndex, cards.length]);

  // Sticky header bar that includes the holiday banner and top nav
  return (
    <>
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
              // Authenticated user - show account icon with dropdown
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
                
                {/* Dropdown menu */}
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
                    <Link href="/dashboard/general" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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
              // Not authenticated - show pricing and sign up
              <>
                <a href="/pricing" className="text-white text-sm hover:text-white/80 transition-colors">Pricing</a>
                <Link href="/sign-up" className="bg-white text-gray-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Hero section with background image, headline, subtext, email input, and CTA button */}
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
          <h1 className="text-white text-6xl font-light mb-6 leading-tight">Avoid the Rain</h1>
          <p className="text-white text-xl mb-12 max-w-2xl leading-relaxed">
            Luxury cards arrive just in time for holidays and milestones. You sign, send, and stay connected without the mental load.
          </p>
          {/* Hide email signup for authenticated users */}
          {!isAuthenticated && (
            <div className="flex items-center gap-4 flex-nowrap w-full max-w-lg mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-4 rounded-lg border border-white/30 text-white bg-white/10 backdrop-blur-sm placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
              />
              <button className="bg-white text-gray-900 px-8 py-4 rounded-lg text-base font-medium whitespace-nowrap hover:bg-gray-100 transition-colors">
                Sign Up
              </button>
            </div>
          )}
          {/* Show welcome message for authenticated users */}
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
      
      {/* Carousel section showing card previews with images and titles */}
      <section className="bg-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-gray-900 text-4xl font-light">Our Card Samples</h2>
            <a href="#" className="text-gray-600 underline hover:text-gray-900 transition-colors">View All</a>
          </div>
          
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-700 w-10 h-10 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-700 w-10 h-10 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center"
              aria-label="Scroll right"
            >
              ›
            </button>

            {/* Cards Container */}
            <div 
              ref={carouselRef}
              className={`flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {infiniteCards.map((card, index) => (
                <div 
                  key={index}
                  className="flex-none w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
                >
                  <div 
                    className="bg-white overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 rounded-lg cursor-pointer h-full"
                    onClick={(e) => {
                      if (!isDragging) {
                        setSelectedCard(card);
                      }
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="relative aspect-[2/3] w-full">
                      <img 
                        src={card.src} 
                        alt={card.title} 
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                      />
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="text-gray-900 font-medium text-base">{card.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{card.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rotating quote/testimonial section using animation */}
      <section className="bg-gray-50 py-24 px-8">
        <div className="text-center max-w-4xl mx-auto">
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
      </section>

      {/* Reminder teaser component section */}
      <section className="bg-gray-800 py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-white mb-4">Create Your Reminder</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Craft personalized reminders for your loved ones. We'll send beautiful cards on their special occasions.
            </p>
            <Link 
              href="/create-reminder"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Creating Reminder
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="w-full py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="text-gray-900 px-8 flex flex-col items-start justify-center h-full space-y-8">
                <h2 className="text-4xl font-light">How it works</h2>
                <div className="border border-gray-200 rounded-lg w-full max-w-lg bg-white shadow-sm">
                  <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">1</div>
                    <span className="text-gray-700">Add your loved ones and their special dates</span>
                  </div>
                  <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">2</div>
                    <span className="text-gray-700">We send you beautiful cards before each occasion</span>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">3</div>
                    <span className="text-gray-700">You sign and send - that's it!</span>
                  </div>
                </div>
                <div className="text-gray-600 italic text-lg">Thoughtfulness delivered to your door!</div>
                <Button className="mt-6 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors">OUR MISSION</Button>
              </div>
              <div className="w-full h-full">
                <img
                  src={[
                    "/howitworks/1phonelist.jpg",
                    "/howitworks/2phonecalendar.jpg",
                    "/howitworks/3cardrecived.jpg",
                    "/howitworks/4mailbox.jpg"
                  ][currentIndex]}
                  alt="How it works"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-gray-800 py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-white mb-4">Why Choose Avoid the Rain?</h2>
            <p className="text-lg text-white/90">See how we compare to traditional options</p>
          </div>
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-6 text-white font-medium text-lg">Feature</th>
                  <th className="text-center p-6 text-white font-medium text-lg bg-gray-800">Avoid the Rain</th>
                  <th className="text-center p-6 text-white/80 font-medium text-lg">Store-Bought Cards</th>
                  <th className="text-center p-6 text-white/80 font-medium text-lg">Forgetting</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-white/90">Automatic reminders</td>
                  <td className="text-center p-6 bg-gray-800">
                    <svg className="w-6 h-6 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6">
                    <svg className="w-6 h-6 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6">
                    <svg className="w-6 h-6 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-white/90">Premium card quality</td>
                  <td className="text-center p-6 bg-gray-800">
                    <svg className="w-6 h-6 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6 text-white/70 text-sm">Basic</td>
                  <td className="text-center p-6 text-white/50 text-sm">N/A</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-white/90">Delivered to your door</td>
                  <td className="text-center p-6 bg-gray-800">
                    <svg className="w-6 h-6 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6">
                    <svg className="w-6 h-6 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6 text-white/50 text-sm">N/A</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-white/90">Pre-stamped & addressed</td>
                  <td className="text-center p-6 bg-gray-800">
                    <svg className="w-6 h-6 text-green-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6">
                    <svg className="w-6 h-6 text-red-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </td>
                  <td className="text-center p-6 text-white/50 text-sm">N/A</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-6 text-white/90">Mental load</td>
                  <td className="text-center p-6 bg-gray-800 text-green-400 font-medium">Zero</td>
                  <td className="text-center p-6 text-orange-400 font-medium">High</td>
                  <td className="text-center p-6 text-red-400 font-medium">Guilt</td>
                </tr>
                <tr>
                  <td className="p-6 text-white/90 font-medium">Time investment</td>
                  <td className="text-center p-6 bg-gray-800 text-green-400 font-medium">5 min setup</td>
                  <td className="text-center p-6 text-white/80 font-medium">30+ min/card</td>
                  <td className="text-center p-6 text-white/60 font-medium">Relationship damage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Updated full-width Holiday section */}
      <section className="w-full bg-gray-50">
        <Newsletter />
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2">
          <div className="h-full w-full">
            <Image
              src="/holidaystack.png"
              alt="Holiday Image"
              width={1200}
              height={800}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-12 py-20">
            <h2 className="text-4xl font-light text-gray-900 mb-6">Need bulk cards?</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Sometimes you need to send cards out all in one-go! With our holiday package you send us a list of recipients, a reminder to what to write in the card, and we send you variety of hand curated cards stamped and ready to go!
            </p>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-lg w-fit hover:bg-gray-800 transition-colors font-medium">Sign Up</button>
          </div>
        </div>
      </section>
      {/* FAQ section using Accordion component */}
      <section className="bg-white py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light text-center mb-12 text-gray-900">FAQ</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="faq-1" className="border border-gray-200 rounded-lg bg-white shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:text-gray-700">Do I get to pick the card?</AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600">
                No and that's intentional! We aim to keep you in touch with the people you care about while removing as much of the mental load as possible.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2" className="border border-gray-200 rounded-lg bg-white shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:text-gray-700">Will the cards be appropriate?</AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600">
                Always! We design cards for real relationships, no cringey jokes, no corporate vibes, no lazy designs. Just smart, subtle, personal and custom to your relationship.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3" className="border border-gray-200 rounded-lg bg-white shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:text-gray-700">What if I'm bad at writing messages?</AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-600">
                No problem, just sign the card and you're good-to-go. There's also an optional concierge tier where we write the message for you using your reminder prompt which looks like you wrote it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Card Zoom Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedCard(null)}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-5xl font-light leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-full">
              <div className="relative flex-shrink-0 overflow-hidden" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <img 
                  src={selectedCard.src} 
                  alt={selectedCard.title} 
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="p-6 bg-white flex-shrink-0">
                <h3 className="text-2xl font-light text-gray-900 mb-1">{selectedCard.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedCard.price}</p>
                <p className="text-gray-500 text-xs">Click outside or press × to close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
