'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getTeamForUser } from '@/lib/db/queries';

export async function checkoutAction(priceId: string) {
  const team = await getTeamForUser();
  
  if (!team) {
    // User needs to sign in first
    redirect(`/sign-in?redirect=/pricing&priceId=${priceId}`);
  }

  // Create Stripe checkout session
  await createCheckoutSession({ team, priceId });
}

export async function manageBillingAction() {
  const team = await getTeamForUser();
  
  if (!team) {
    redirect('/sign-in');
  }

  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
}
