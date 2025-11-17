'use server';

import { getTeamForUser } from '@/lib/db/queries';
import { createCheckoutSession, createOneTimeCheckoutSession } from './stripe';

export async function checkoutAction(priceId: string) {
  const team = await getTeamForUser();
  await createCheckoutSession({ team, priceId });
}

export async function manageBillingAction() {
  const { createCustomerPortalSession } = await import('./stripe');
  const team = await getTeamForUser();
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  const portalSession = await createCustomerPortalSession(team);
  return portalSession.url;
}

export async function purchaseCardCreditAction() {
  const { STRIPE_ONE_TIME_PRODUCTS } = await import('./config');
  const team = await getTeamForUser();
  
  await createOneTimeCheckoutSession({ 
    team, 
    priceId: STRIPE_ONE_TIME_PRODUCTS.cardCredit.priceId 
  });
}
