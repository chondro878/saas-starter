'use client';

import Link from 'next/link';
import { User, RecipientWithOccasions } from '@/lib/db/schema';
import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { HolidayCarousel } from '../components/holiday-carousel';
import { IOSDownload } from '../components/ios-download';
import { SubscriptionAlert } from '../components/subscription-alert';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Get colors based on relationship
const getRelationshipColors = (relationship: string) => {
  switch (relationship.toLowerCase()) {
    case 'family':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        avatar: 'bg-green-500'
      };
    case 'friend':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        avatar: 'bg-blue-500'
      };
    case 'romantic':
      return {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        avatar: 'bg-pink-500'
      };
    case 'professional':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        avatar: 'bg-purple-500'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        avatar: 'bg-gray-500'
      };
  }
};

function RecipientCard({ recipient }: { recipient: RecipientWithOccasions }) {
  const initials = `${recipient.firstName[0]}${recipient.lastName[0]}`;
  const colors = getRelationshipColors(recipient.relationship);
  
  // Get the next upcoming occasion
  const nextOccasion = recipient.occasions?.[0];
  
  return (
    <div className="flex-shrink-0 flex flex-col items-center space-y-3">
      <div className={`w-40 h-40 ${colors.avatar} rounded-full flex items-center justify-center`}>
        <span className="text-white text-5xl font-light">{initials}</span>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-normal text-gray-900">
          {recipient.firstName} {recipient.lastName}
        </h3>
        <span className={`text-sm ${colors.text} ${colors.bg} px-3 py-1 rounded-full inline-block`}>
          {recipient.relationship}
        </span>
      </div>
    </div>
  );
}

export default function DashboardHomePage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: recipients, error, isLoading } = useSWR<RecipientWithOccasions[]>('/api/recipients', fetcher);
  
  // Extract first name from profile, name, or email
  const firstName = user?.firstName || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <div className="flex-1 p-8 lg:p-12">
      {/* Header */}
      <h1 className="text-5xl font-light text-gray-900 mb-6">
        Hi, {firstName}
      </h1>

      {/* Subscription Alert */}
      <SubscriptionAlert />

      {/* Ready to add a reminder? - Only show if no recipients */}
      {!isLoading && !error && (!recipients || recipients.length === 0) && (
        <section className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl p-12 mb-8 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900 leading-tight">
            Ready to add a reminder?
          </h2>
          <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
            It takes less than 2 minutes to never miss a moment.
          </p>
          <Link 
            href="/create-reminder" 
            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors shadow-lg"
          >
            Create Your First Reminder
          </Link>
        </section>
      )}

      {/* Holiday Promotion Carousel */}
      <HolidayCarousel />

      {/* What would you like to do? */}
      <section className="bg-gradient-to-br from-amber-100 via-orange-50 to-pink-100 rounded-2xl p-8 mb-8">
        <h2 className="text-3xl font-light text-center mb-8 text-gray-900">What would you like to do?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/create-reminder" className="bg-white rounded-xl p-8 hover:shadow-xl transition-all group">
            <h3 className="text-xl font-medium mb-2 text-gray-900 group-hover:text-gray-900">Add a Reminder</h3>
            <p className="text-gray-600 leading-relaxed">Set up a new card reminder for someone special</p>
          </Link>
          <Link href="/dashboard/general" className="bg-white rounded-xl p-8 hover:shadow-xl transition-all group">
            <h3 className="text-xl font-medium mb-2 text-gray-900 group-hover:text-gray-900">Manage Recipients</h3>
            <p className="text-gray-600 leading-relaxed">View and edit your saved recipients</p>
          </Link>
          <Link href="/dashboard/holiday-packs" className="bg-white rounded-xl p-8 hover:shadow-xl transition-all group">
            <h3 className="text-xl font-medium mb-2 text-gray-900 group-hover:text-gray-900">Holiday Packs</h3>
            <p className="text-gray-600 leading-relaxed">Order bulk cards for upcoming holidays</p>
          </Link>
        </div>
      </section>

      {/* iOS App Download */}
      <IOSDownload />

      {/* Friends & Family Section */}
      <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-3xl font-normal text-gray-900 mb-2">Friends & Family</h2>
          <p className="text-gray-600">
            Keep track of all the special people in your life
          </p>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-8 overflow-x-auto pb-8 mb-6">
            <div className="flex-shrink-0 flex flex-col items-center space-y-3">
              <div className="w-40 h-40 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <p className="text-red-500 mb-6">Failed to load recipients. Please try again.</p>
        )}

        {/* Recipients Carousel */}
        {!isLoading && !error && (
          <>
            {recipients && recipients.length > 0 ? (
              <div className="flex gap-8 overflow-x-auto pb-8 mb-6">
                {recipients.map((recipient) => (
                  <RecipientCard key={recipient.id} recipient={recipient} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center mb-6 shadow-sm">
                <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No recipients yet</h3>
                <p className="text-gray-600 mb-6">Start by adding people you'd like to send cards to</p>
                <Link
                  href="/dashboard/general"
                  className="inline-block px-8 py-3 bg-gray-900 text-white rounded-full text-base font-medium hover:bg-gray-800 transition-colors"
                >
                  Add Your First Recipient
                </Link>
              </div>
            )}
          </>
        )}

        {/* Manage Recipients Button */}
        {recipients && recipients.length > 0 && (
          <Link
            href="/dashboard/general"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-base font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
          >
            Manage Recipients
          </Link>
        )}
      </div>
    </div>
  );
}
