import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background - same as sign-up page */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col justify-center items-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Frosted Glass Card */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-12 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Heart className="w-20 h-20 text-purple-400 fill-purple-200" />
                <div className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  !
                </div>
              </div>
            </div>

            {/* Text */}
            <h1 className="text-6xl font-light text-gray-900 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-medium text-gray-800 mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Looks like this page got lost in the mail. Let's get you back to creating meaningful connections with those you care about.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create-reminder"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create a Reminder
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/70 hover:bg-white border-2 border-gray-300 text-gray-800 font-medium rounded-full transition-all shadow-md"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* Bottom Logo */}
          <div className="mt-8">
            <Link href="/" className="text-gray-700 font-medium opacity-60 hover:opacity-100 transition-opacity">
              Avoid the Rain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
