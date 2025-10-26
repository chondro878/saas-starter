'use client';

// This is your main layout file for all pages within the /dashboard route.
// It includes the top user navigation (sign in/sign out, avatar, etc.)
// and a footer section with newsletter sign-up and links.
// All page content will render between these two sections via the {children} prop.

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/app/(dashboard)/components/ui/button';
import { CircleIcon, Home, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/app/(dashboard)/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/(dashboard)/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import Footer from '@/app/(dashboard)/components/ui/footer';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// This component displays the user avatar and dropdown menu.
// If the user is not signed in, it shows Sign Up and Pricing links.
// If signed in, it shows the dashboard link and sign-out option.
function UserMenu() {
  // useSWR fetches current user data from /api/user
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  // Sign-out function triggers mutation and redirects to home
  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  // The main layout rendering the children followed by a site footer
  return (
    <section className="flex flex-col min-h-screen">
      {children}
      <Footer />
    </section>
  );
}
