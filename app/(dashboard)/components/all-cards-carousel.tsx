'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';

export function AllCardsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // All sample card images
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
    <div className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-4">
            Browse All Cards
          </h2>
          <p className="text-xl text-gray-600 font-light">
            Beautiful designs for every occasion
          </p>
        </div>
        
        {/* Card Carousel */}
        <div className="relative mb-8">
          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}
          
          {currentIndex < Math.ceil(cardImages.length / 3) - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          )}
          
          {/* Cards Container */}
          <div
            ref={carouselRef}
            className="overflow-hidden"
          >
            <div className="flex gap-6">
              {cardImages.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[calc(33.333%-1rem)]"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 duration-300">
                    <Image
                      src={image}
                      alt={`Sample card ${index + 1}`}
                      width={400}
                      height={533}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            href="/sign-up"
            className="px-10 py-4 border-2 border-gray-900 text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

