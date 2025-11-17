'use client';

import { Smartphone } from 'lucide-react';

export function IOSDownload() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 sm:p-8 text-white mb-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        {/* Icon/Image Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl flex items-center justify-center">
            <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-gray-900" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-medium mb-2">
            Download Our iOS App
          </h3>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            Manage your card reminders on the go with our mobile app
          </p>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <div className="bg-white text-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Download on the App Store
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

