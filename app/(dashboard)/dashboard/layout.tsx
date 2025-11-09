'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Grid, CreditCard, Package, RefreshCw, HelpCircle, LogOut, Printer, FileText, AlertCircle } from 'lucide-react';
import { User, Team } from '@/lib/db/schema';
import useSWR from 'swr';
import { signOut } from '@/app/(login)/actions';

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
    { href: '/dashboard/general', icon: Grid, label: 'Friends & Family' },
    { href: '/dashboard/holiday-packs', icon: Package, label: 'Holiday Packs' },
    { href: '/dashboard/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
    { href: '/dashboard/security', icon: CreditCard, label: 'Account Settings' },
    { href: '/dashboard/fulfillment', icon: Printer, label: 'Fulfillment Dashboard', adminOnly: true },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors relative ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : shouldHighlight
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 font-medium border-2 border-red-300'
                        : 'text-gray-700 hover:bg-gray-50'
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                Help & Support
              </Link>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}
