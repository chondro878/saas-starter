'use client';

import useSWR from 'swr';
import { Team } from '@/lib/db/schema';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SubscriptionAlert() {
  const { data: team } = useSWR<Team>('/api/team', fetcher);

  // No longer showing alerts - menu highlighting handles this
  return null;
}

