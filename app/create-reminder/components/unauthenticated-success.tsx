'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';

interface UnauthenticatedSuccessProps {
  recipientName: string;
}

export function UnauthenticatedSuccess({ recipientName }: UnauthenticatedSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="relative inline-block mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
          <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
        
        {/* Heading */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Great! We've saved your reminder for {recipientName}
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Create an account to complete your setup and never miss another special occasion!
        </p>

        {/* CTA Button - Plain anchor for guaranteed navigation */}
        <a 
          href="/sign-up?from=create-reminder"
          className="block w-full py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all text-center no-underline"
        >
          Sign Up Now
        </a>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-1">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Your reminder is saved for 24 hours
        </p>
      </div>
    </div>
  );
}

