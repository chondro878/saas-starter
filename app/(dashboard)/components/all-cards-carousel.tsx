'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function AllCardsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
  
  // Triple the cards for infinite scroll effect
  const infiniteCards = [...cardImages, ...cardImages, ...cardImages];
  
  const scrollToIndex = (index: number, smooth = true) => {
    if (carouselRef.current) {
      // On mobile, show 1 card at a time; on desktop, show 3
      const isMobile = window.innerWidth < 768;
      // Get the actual scrollable width (accounting for padding)
      const containerWidth = carouselRef.current.offsetWidth;
      const cardWidth = isMobile 
        ? containerWidth * 0.85 + 16 // 85% width + gap (gap-4 = 16px)
        : (containerWidth / 3) - (containerWidth * 0.02); // Account for gap on desktop
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
    <div className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-4">
            Sample Cards
          </h2>
          <p className="text-xl text-gray-600 font-light">
            A preview of the beautifully designed cards you'll receive
          </p>
        </div>
        
        {/* Card Carousel */}
        <div className="relative mb-8" aria-label="Card gallery carousel">
          {/* Navigation Arrows - Always visible for infinite scroll */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
            aria-label="Previous cards"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900" aria-hidden="true" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900"
            aria-label="Next cards"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-900" aria-hidden="true" />
          </button>
          
          {/* Cards Container - Add padding on mobile to show previews */}
          <div
            ref={carouselRef}
            className="overflow-hidden px-[7.5%] md:px-0"
          >
            <div className="flex gap-4 md:gap-6">
              {infiniteCards.map((image, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[85%] md:w-[calc(33.333%-1rem)]"
                >
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 duration-300 w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
                    aria-label={`View sample card ${(index % cardImages.length) + 1} in full size`}
                  >
                    <Image
                      src={image}
                      alt={`Sample card ${(index % cardImages.length) + 1}`}
                      width={400}
                      height={533}
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
      </div>
    </div>
  );
}

