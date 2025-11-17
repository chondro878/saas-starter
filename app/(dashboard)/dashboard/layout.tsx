'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ContactRound, CreditCard, Package, RefreshCw, MessageCircleQuestion, LogOut, Printer, FileText, AlertCircle, Menu, X } from 'lucide-react';
import { User, Team } from '@/lib/db/schema';
import useSWR from 'swr';
import { signOut } from '@/app/(login)/actions';
import { NavigationProgress } from '@/components/navigation-progress';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const { data: team } = useSWR<Team>('/api/team', fetcher);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Check if subscription needs attention
  const needsSubscriptionAttention = team && (
    !team.subscriptionStatus || 
    team.subscriptionStatus === 'canceled' || 
    team.subscriptionStatus === 'unpaid' || 
    team.subscriptionStatus === 'trialing' ||
    team.subscriptionStatus === 'past_due' ||
    team.subscriptionStatus === 'incomplete'
  );

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/friendsandfamily', icon: ContactRound, label: 'Friends & Family' },
    { href: '/dashboard/holiday-packs', icon: Package, label: 'Holiday Packs' },
    { href: '/dashboard/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
    { href: '/dashboard/security', icon: CreditCard, label: 'Account Settings' },
    { href: '/dashboard/orders', icon: FileText, label: 'Order History' },
    { href: '/dashboard/fulfillment', icon: Printer, label: 'Fulfillment Dashboard', adminOnly: true },
  ];

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <NavigationProgress />
      
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-white/50 z-30 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-normal text-gray-900">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || 'User'}
            </h2>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown - Full Screen */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[73px] bg-white/80 backdrop-blur-xl z-20 overflow-y-auto">
          <div className="p-6">
            {/* Main Navigation */}
            <nav className="mb-8">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  // Hide admin-only items for non-admin users
                  if (item.adminOnly && user?.role !== 'owner') {
                    return null;
                  }
                  
                  // Check if this is the subscriptions item and needs attention
                  const isSubscriptionsItem = item.href === '/dashboard/subscriptions';
                  const shouldHighlight = isSubscriptionsItem && needsSubscriptionAttention;
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all relative ${
                          pathname === item.href
                            ? 'text-gray-900 font-medium shadow-2xl bg-white'
                            : shouldHighlight
                            ? 'bg-red-50 text-red-700 hover:shadow-2xl font-medium border-2 border-red-300'
                            : 'text-gray-700 hover:shadow-2xl hover:bg-white'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                        {shouldHighlight && (
                          <AlertCircle className="w-4 h-4 text-red-600 ml-auto animate-pulse" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Bottom Navigation */}
            <div className="pt-6 border-t border-gray-200">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard/help"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-white hover:shadow-2xl transition-all"
                  >
                    <MessageCircleQuestion className="w-5 h-5" />
                    Help & Support
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-white hover:shadow-2xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex w-80 bg-white/60 backdrop-blur-xl border-r border-white/50 flex-col fixed left-0 top-0 h-screen z-10 shadow-2xl">
        {/* User Profile Section */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-xl font-normal text-gray-900 mb-1">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.name || 'User'}
          </h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              // Hide admin-only items for non-admin users
              if (item.adminOnly && user?.role !== 'owner') {
                return null;
              }
              
              // Check if this is the subscriptions item and needs attention
              const isSubscriptionsItem = item.href === '/dashboard/subscriptions';
              const shouldHighlight = isSubscriptionsItem && needsSubscriptionAttention;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all relative ${
                      pathname === item.href
                        ? 'text-gray-900 font-medium shadow-2xl'
                        : shouldHighlight
                        ? 'bg-red-50 text-red-700 hover:shadow-2xl font-medium border-2 border-red-300'
                        : 'text-gray-700 hover:shadow-2xl'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {shouldHighlight && (
                      <AlertCircle className="w-4 h-4 text-red-600 ml-auto animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-6 border-t border-gray-200">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard/help"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-gray-50 hover:shadow-2xl transition-all"
              >
                <MessageCircleQuestion className="w-5 h-5" />
                Help & Support
              </Link>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-gray-50 hover:shadow-2xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto lg:ml-80 pt-16 lg:pt-0 relative z-0 min-h-screen">{children}</main>
    </div>
  );
}
