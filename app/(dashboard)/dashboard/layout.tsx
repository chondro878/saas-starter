'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Grid, CreditCard, Package, RefreshCw, HelpCircle, LogOut } from 'lucide-react';
import { User } from '@/lib/db/schema';
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/general', icon: Grid, label: 'Friends & Family' },
    { href: '/dashboard/security', icon: CreditCard, label: 'Account Settings' },
    { href: '/dashboard/holiday-packs', icon: Package, label: 'Holiday Packs' },
    { href: '/dashboard/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile Section */}
        <div className="p-8 border-b border-gray-200">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarFallback className="bg-gray-300 text-gray-600 text-2xl">
              {user?.firstName && user?.lastName
                ? `${user.firstName[0]}${user.lastName[0]}`
                : user?.name?.split(' ').map(n => n[0]).join('') || user?.email?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
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
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
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
