'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function MeetOurArtists() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Artist images
  const artistImages = [
    '/artistphoto1.png',
    '/artistphoto2.png',
    '/artistphoto3.png',
  ];

  // Cycle through images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % artistImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [artistImages.length]);

  return (
    <section className="w-full relative py-32 overflow-hidden">
      {/* Background with unique gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
        <div className="absolute inset-0 bg-gradient-to-tl from-green-100 via-transparent to-transparent opacity-50"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-light mb-6 text-gray-900 leading-tight">
            Meet our artists
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 font-light leading-relaxed max-w-3xl mx-auto">
            We partner with independent artists to bring you unique, beautifully designed cards. 
            Each card you receive is a one-of-a-kind piece of art, crafted with care and creativity.
          </p>
        </div>

        {/* Image Gallery with Cycling Effect */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {artistImages.map((image, index) => {
              const isActive = index === currentImageIndex;
              const isNext = index === (currentImageIndex + 1) % artistImages.length;
              const isPrev = index === (currentImageIndex - 1 + artistImages.length) % artistImages.length;
              
              return (
                <div
                  key={index}
                  className={`
                    relative aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-700 ease-in-out
                    ${isActive
                      ? 'scale-100 opacity-100 z-10 shadow-2xl'
                      : isNext || isPrev
                      ? 'scale-95 opacity-60 z-0'
                      : 'scale-90 opacity-40 z-0'
                    }
                  `}
                >
                  <Image
                    src={image}
                    alt={`Independent artist ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {artistImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentImageIndex 
                    ? 'bg-gray-900 w-8' 
                    : 'bg-gray-400 hover:bg-gray-600'
                  }
                `}
                aria-label={`View artist ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
            Every card is thoughtfully selected from our curated collection of independent artists, 
            ensuring you receive something truly special and unique.
          </p>
        </div>
      </div>
    </section>
  );
}

