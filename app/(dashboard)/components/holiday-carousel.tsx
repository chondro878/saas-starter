'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getNextHolidays } from '@/lib/holidays';
import { purchaseCardCreditAction } from '@/lib/payments/actions';

interface HolidayCarouselProps {
  holidayIndex?: number; // Which holiday to display (0 = next, 1 = second next, etc.)
  showBuyButton?: boolean;
  showCreditButton?: boolean;
}

export function HolidayCarousel({ 
  holidayIndex = 0, 
  showBuyButton = true,
  showCreditButton = false 
}: HolidayCarouselProps) {
  const nextHolidays = getNextHolidays(3);
  const holiday = nextHolidays[holidayIndex];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingCredit, setIsLoadingCredit] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handlePurchaseCredit = async () => {
    setIsLoadingCredit(true);
    try {
      await purchaseCardCreditAction();
    } catch (error) {
      console.error('Error purchasing card credit:', error);
      setIsLoadingCredit(false);
    }
  };
  
  if (!holiday) return null;
  
  // Sample card images (8 cards)
  const cardImages = [
    '/SampleCard1.JPG',
    '/SampleCard2.jpg',
    '/SampleCard3.jpg',
    '/SampleCard4.JPG',
    '/SampleCard5.jpg',
    '/SampleCard6.jpg',
    '/SampleCard7.jpg',
    '/SampleCard8.jpg',
  ];
  
  // Triple the cards for infinite scroll effect
  const infiniteCards = [...cardImages, ...cardImages, ...cardImages];
  
  const scrollToIndex = (index: number, smooth = true) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth / 3;
      const scrollAmount = index * cardWidth;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
    setCurrentIndex(index);
  };
  
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle infinite scroll wrapping
  useEffect(() => {
    if (currentIndex >= cardImages.length * 2) {
      // Wrap back to the start (second set)
      setTimeout(() => {
        scrollToIndex(cardImages.length, false);
      }, 500);
    } else if (currentIndex < cardImages.length) {
      scrollToIndex(currentIndex, true);
    } else {
      scrollToIndex(currentIndex, true);
    }
  }, [currentIndex, cardImages.length]);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };
  
  return (
    <div className={`${holiday.color.secondary} rounded-2xl p-8 mb-8`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-3xl font-normal ${holiday.color.text}`}>
            {holiday.name}
          </h2>
          <span className={`${holiday.color.primary} text-white px-4 py-2 rounded-full text-sm font-medium`}>
            {holiday.daysUntil} days until {holiday.name}
          </span>
        </div>
        <p className="text-gray-600">
          Send beautiful cards to your loved ones this {holiday.name}
        </p>
      </div>
      
      {/* Card Carousel */}
      <div className="relative mb-6" aria-label={`${holiday.name} card carousel`}>
        {/* Navigation Arrows - Always visible for infinite scroll */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
          aria-label="Previous cards"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900" aria-hidden="true" />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
          aria-label="Next cards"
        >
          <ChevronRight className="w-6 h-6 text-gray-900" aria-hidden="true" />
        </button>
        
        {/* Cards Container */}
        <div
          ref={carouselRef}
          className="overflow-hidden"
        >
          <div className="flex gap-4">
            {infiniteCards.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[calc(33.333%-0.67rem)]"
              >
                <button
                  onClick={() => setSelectedImage(image)}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
                  aria-label={`View ${holiday.name} card ${(index % cardImages.length) + 1} in full size`}
                >
                  <Image
                    src={image}
                    alt={`Sample card ${(index % cardImages.length) + 1}`}
                    width={300}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Card preview"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-2"
            aria-label="Close preview"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="relative max-w-3xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Card preview"
              width={800}
              height={1066}
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg"
              priority
            />
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-4 items-center">
        {showBuyButton && (
          <div className={`px-8 py-3 ${holiday.color.primary} text-white rounded-full text-base font-medium opacity-60 cursor-not-allowed`}>
            Coming Soon
          </div>
        )}
        {showCreditButton && (
          <button
            onClick={handlePurchaseCredit}
            disabled={isLoadingCredit}
            className="flex items-center gap-2 px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full text-base font-medium hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {isLoadingCredit ? 'Processing...' : 'Additional Cards'}
          </button>
        )}
      </div>
    </div>
  );
}

