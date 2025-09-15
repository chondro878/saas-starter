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
import type { CarouselApi } from "@/components/ui/carousel";
import { getNextHoliday } from "@/lib/occasions";
import { useMemo } from "react";
import Image from 'next/image';
import Link from "next/link";
import { ReminderForm } from "./components/form/reminder-form";
import SplitTeaser from "./components/ui/split-teaser";
import Newsletter from "./components/ui/newsletter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Carousel, CarouselItem, CarouselContent } from "@/components/ui/carousel";
import Step from "@/app/(dashboard)/components/ui/step";

// Quotes shown in the rotating testimonial section
export default function Home() {
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
  const [api, setApi] = useState<CarouselApi | null>(null);

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

  // Sticky header bar that includes the holiday banner and top nav
  return (
    <>
      <div className="sticky top-0 z-50 w-full">
        {nextHoliday && (
          <div className="text-white text-center py-0.5 text-xs font-medium" style={{ backgroundColor: '#708238', paddingTop: '4px', paddingBottom: '4px' }}>
            Only {nextHoliday.daysUntil} days until {nextHoliday.name}!
          </div>
        )}
        <div className="bg-black text-white flex justify-between items-center px-6 py-2">
          <h1 className="text-xl font-semibold">Avoid the Rain</h1>
          <div className="flex gap-4 items-center">
            <a href="/pricing" className="text-white text-sm hover:underline">Pricing</a>
            <Link href="/sign-up" className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium">Sign Up</Link>
          </div>
        </div>
      </div>
      {/* Hero section with background image, headline, subtext, email input, and CTA button */}
      <main className="relative min-h-screen w-full overflow-hidden pt-4">
        <Image
          src="/hero.png"
          alt="Hero"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-opacity-40 flex flex-col items-start justify-end px-10 pb-28">
          <h1 className="text-white text-5xl font-bold mb-2">Avoid the Rain</h1>
          <p className="text-white text-lg mb-10 max-w-lg">
            Luxuary cards arrive just in time for holidays, and milestones. You sign, send, and stay connected without the mental load.
          </p>
          <div className="flex items-center gap-4 flex-nowrap w-full max-w-md mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-md border border-white text-white bg-transparent placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-black px-6 py-2 rounded-md text-base font-medium whitespace-nowrap hover:bg-gray-200 transition">
              Sign Up
            </button>
          </div>
        </div>
      </main>
      {/* Rotating quote/testimonial section using animation */}
      <section className="bg-white text-black py-24 px-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="overflow-hidden relative h-32 transition-all duration-500 ease-in-out">
            <div className="animate-fade-slide" key={quoteIndex}>
              <blockquote className="text-5xl italic font-light">
                ‘{quotes[quoteIndex].text}’
              </blockquote>
              <p className="mt-4 text-xl text-gray-700">- {quotes[quoteIndex].source}</p>
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
      {/* Carousel section showing card previews with images and titles */}
      <section className="bg-white text-black py-12 overflow-visible min-h-[500px]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-black text-5xl font-semibold">   Our Card Samples</h2>
          <a href="#" className="text-black underline hover:text-gray-700">View All</a>
        </div>
        <Carousel className="relative" setApi={setApi}>
          <CarouselContent data-carousel-content>
            {[
              { src: "/SampleCard1.jpg", title: "Love", price: "$5" },
              { src: "/SampleCard2.jpg", title: "Anniversary", price: "$6" },
              { src: "/SampleCard3.jpg", title: "Just Because", price: "$4" },
              { src: "/SampleCard4.jpg", title: "Congrats!", price: "$3" },
              { src: "/SampleCard5.jpg", title: "Patriotic", price: "$4" },
              { src: "/SampleCard6.jpg", title: "Love", price: "$5" },
              { src: "/SampleCard7.jpg", title: "Happy Birthday", price: "$4" },
              { src: "/SampleCard8.jpg", title: "Congradulation", price: "$3" }
            ].map((card, index) => (
              <CarouselItem key={index} className="basis-1/2 md:basis-1/4 py-4">
                <div className="bg-white overflow-hidden shadow-md hover:outline hover:outline-1 hover:outline-black transition flex flex-col h-full min-h-[300px]">
                  <div className="relative aspect-[2/3] w-full">
                    <img src={card.src} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="text-black font-medium text-base">{card.title}</h3>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Left Navigation Button */}
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-2 rounded-r-md z-10 hover:bg-gray-200"
            onClick={() => api?.scrollPrev()}
          >
            ‹
          </button>

          {/* Right Navigation Button */}
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-2 rounded-l-md z-10 hover:bg-gray-200"
            onClick={() => api?.scrollNext()}
          >
            ›
          </button>
        </Carousel>
        <Step />
      </section>
      {/* Reminder teaser component section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <ReminderForm
            defaultValues={{
              firstPerson: {
                first: "Penny",
                last: "Showers"
              },
              address: {
                street: "123 Rainy Lane",
                city: "Seattle",
                state: "WA",
                zip: "98144"
              },
              relationship: "Friend",
              occasion: "Birthday",
              date: new Date("1990-05-10"),
              note: "Remember how much fun we had during the lake trip!"
            }}
          />
        </div>
      </section>
      <section>
        <div className="bg-[#264aa9]">
          <SplitTeaser
            leftContent={
              <div className="text-white px-6 flex flex-col items-start justify-center h-full space-y-6">
                <h2 className="text-3xl font-bold">How it works</h2>
                <div className="border border-white w-full max-w-md">
                  <div className="flex items-center gap-2 border-b border-white px-4 py-3">
                    <span>1.</span>
                    <span>Test thing</span>
                  </div>
                  <div className="flex items-center gap-2 border-b border-white px-4 py-3">
                    <span>2</span>
                    <span>Another test thing</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <span>3</span>
                    <span>Super easy right!?</span>
                  </div>
                </div>
                <div className="italic">Thouthfulness delivered to your door!</div>
                <Button variant="default" className="mt-4">OUR MISSION</Button>
              </div>
            }
            rightContent={
              <div className="w-full h-full">
                <img
                  src={[
                    "/howitworks/1phonelist.jpg",
                    "/howitworks/2phonecalendar.jpg",
                    "/howitworks/3cardrecived.jpg",
                    "/howitworks/4mailbox.jpg"
                  ][currentIndex]}
                  alt="How it works"
                  className="w-full h-full object-cover"
                />
              </div>
            }
          />
        </div>
      </section>
      {/* Updated full-width Holiday section */}
      <section className="w-full bg-white">
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
          <div className="flex flex-col justify-center px-8 py-16 pl-16">
            <h2 className="text-3xl font-serif mb-4">Need bulk cards?</h2>
            <p className="text-lg mb-6">
              Sometimes you need to send cards out all in one-go! With our holiday package you send us a list of recipiants, a reminder to what to write in the card, and we send you variety of hand curriated cards stamped and ready to go!
            </p>
            <button className="bg-black text-white px-6 py-3 w-fit">Sign Up</button>
          </div>
        </div>
      </section>
      {/* FAQ section using Accordion component */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Do I get to pick the card?</AccordionTrigger>
              <AccordionContent>
                No and that’s intentional! We aim to keep you in touch with the people you care about while removing as much of the mental load as possible.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Will the cards be appropriate?</AccordionTrigger>
              <AccordionContent>
                Always! We design cards for real relationships, no cringey jokes, no corporate vibes, no lazy designs. Just smart, subtle, personal and custom to your relationship.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>What if I’m bad at writing messages?</AccordionTrigger>
              <AccordionContent>
                No problem, just sign the card and you're good-to-go. There’s also an optional concierge tier where we write the message for you using your reminder prompt which looks like you wrote it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  );
}
