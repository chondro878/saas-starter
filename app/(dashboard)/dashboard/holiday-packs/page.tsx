'use client';

import { HolidayCarousel } from '../../components/holiday-carousel';

export default function HolidayPacksPage() {
  return (
    <div className="flex-1 p-8 lg:p-12">
      <h1 className="text-5xl font-light text-gray-900 mb-6">
        Holiday Packs
      </h1>
      <p className="text-gray-600 text-lg mb-12">
        Get ready for the upcoming holidays with our curated card collections.
      </p>
      
      {/* Next Holiday Carousel */}
      <HolidayCarousel 
        holidayIndex={0}
        showBuyButton={true}
        showManageButton={false}
      />
      
      {/* Second Holiday Carousel */}
      <HolidayCarousel 
        holidayIndex={1}
        showBuyButton={true}
        showManageButton={false}
      />
      
      {/* Third Holiday Carousel */}
      <HolidayCarousel 
        holidayIndex={2}
        showBuyButton={true}
        showManageButton={false}
      />
    </div>
  );
}

