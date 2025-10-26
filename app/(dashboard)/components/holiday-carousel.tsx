'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getNextHolidays } from '@/lib/holidays';

interface HolidayCarouselProps {
  holidayIndex?: number; // Which holiday to display (0 = next, 1 = second next, etc.)
  showBuyButton?: boolean;
  showManageButton?: boolean;
}

export function HolidayCarousel({ 
  holidayIndex = 0, 
  showBuyButton = true,
  showManageButton = true 
}: HolidayCarouselProps) {
  const nextHolidays = getNextHolidays(3);
  const holiday = nextHolidays[holidayIndex];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
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
  
  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const scrollAmount = index * (carouselRef.current.offsetWidth / 3);
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };
  
  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };
  
  const handleNext = () => {
    const maxIndex = Math.ceil(cardImages.length / 3) - 1;
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollToIndex(newIndex);
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
      <div className="relative mb-6">
        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
        )}
        
        {currentIndex < Math.ceil(cardImages.length / 3) - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        )}
        
        {/* Cards Container */}
        <div
          ref={carouselRef}
          className="overflow-hidden"
        >
          <div className="flex gap-4">
            {cardImages.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[calc(33.333%-0.67rem)]"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <Image
                    src={image}
                    alt={`Sample card ${index + 1}`}
                    width={300}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        {showBuyButton && (
          <Link
            href="/dashboard/holiday-packs"
            className={`px-8 py-3 ${holiday.color.primary} text-white rounded-full text-base font-medium hover:opacity-90 transition-opacity`}
          >
            Buy {holiday.name} Pack
          </Link>
        )}
        {showManageButton && (
          <Link
            href="/dashboard/general"
            className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full text-base font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Manage Recipients
          </Link>
        )}
      </div>
    </div>
  );
}

