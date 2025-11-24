'use client';

import Link from 'next/link';
import { User, RecipientWithOccasions } from '@/lib/db/schema';
import useSWR from 'swr';
import { HolidayCarousel } from '../components/holiday-carousel';
import { IOSDownload } from '../components/ios-download';
import { SubscriptionAlert } from '../components/subscription-alert';
import { CardCreditPurchase } from '../components/card-credit-purchase';
import { JustBecauseCreditApply } from '../components/just-because-credit-apply';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardHomePage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: recipients, error, isLoading } = useSWR<RecipientWithOccasions[]>('/api/recipients', fetcher);
  
  // Extract first name from profile, name, or email
  const firstName = user?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12">
      {/* Header */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-6">
        Hi, {firstName}
      </h1>

      {/* Subscription Alert */}
      <SubscriptionAlert />

      {/* Ready to add a reminder? - Only show if no recipients */}
      {!isLoading && !error && (!recipients || recipients.length === 0) && (
        <section className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl p-6 sm:p-8 lg:p-12 mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 text-gray-900 leading-tight">
            Ready to add a reminder?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 font-light leading-relaxed">
            It takes less than 2 minutes to never miss a moment.
          </p>
          <Link 
            href="/create-reminder" 
            className="inline-block bg-gray-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
          >
            Create Your First Reminder
          </Link>
        </section>
      )}

      {/* What would you like to do? */}
      <section className="bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 rounded-2xl p-6 sm:p-8 mb-8">
        <h2 className="text-2xl sm:text-3xl font-light text-center mb-6 sm:mb-8 text-gray-900">What would you like to do?</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/create-reminder" className="bg-white rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all group">
            <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-900 group-hover:text-gray-900">Add a Reminder</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Set up a new card reminder for someone special</p>
          </Link>
          <Link href="/dashboard/friendsandfamily" className="bg-white rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all group">
            <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-900 group-hover:text-gray-900">Manage Recipients</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">View and edit your saved recipients</p>
          </Link>
          <Link href="/dashboard/holiday-packs" className="bg-white rounded-xl p-6 sm:p-8 hover:shadow-xl transition-all group">
            <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-900 group-hover:text-gray-900">Holiday Packs</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Order bulk cards for upcoming holidays</p>
          </Link>
        </div>
      </section>

      {/* Holiday Promotion Carousel */}
      <HolidayCarousel showCreditButton={false} />

      {/* Card Credit Purchase */}
      <CardCreditPurchase />

      {/* Just Because Credit Apply */}
      <JustBecauseCreditApply />

      {/* iOS App Download */}
      <IOSDownload />
    </div>
  );
}
