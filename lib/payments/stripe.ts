import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription,
  addCardCredits
} from '@/lib/db/queries';
import { STRIPE_ONE_TIME_PRODUCTS } from './config';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
});

export async function createCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  // Check if payments are enabled
  const paymentsEnabled = process.env.STRIPE_PAYMENTS_ENABLED === 'true';
  if (!paymentsEnabled) {
    throw new Error('Payments are currently disabled. Please try again later.');
  }

  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true
  });

  redirect(session.url!);
}

export async function createOneTimeCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  // Check if payments are enabled
  const paymentsEnabled = process.env.STRIPE_PAYMENTS_ENABLED === 'true';
  if (!paymentsEnabled) {
    throw new Error('Payments are currently disabled. Please try again later.');
  }

  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/dashboard/subscriptions?purchase=success`,
    cancel_url: `${process.env.BASE_URL}/dashboard/subscriptions`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    metadata: {
      teamId: team.id.toString(),
      productType: 'cardCredit'
    }
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active') {
    const plan = subscription.items.data[0]?.plan;
    const planName = (plan?.product as Stripe.Product).name;
    
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName,
      subscriptionStatus: status
    });

    // Get team owner to send subscription email
    const { db } = await import('@/lib/db/drizzle');
    const { users, teamMembers } = await import('@/lib/db/schema');
    const { eq, and } = await import('drizzle-orm');
    
    const teamOwner = await db
      .select({ user: users })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.role, 'owner')))
      .limit(1);

    if (teamOwner.length > 0) {
      // Send subscription started email
      const { sendSubscriptionStartedEmail } = await import('@/lib/email');
      const cardLimits: Record<string, number> = {
        'Essentials': 5,
        'Stress Free': 12,
        'Concierge': 25,
      };
      
      sendSubscriptionStartedEmail({
        user: teamOwner[0].user,
        planName: planName || 'Essentials',
        cardLimit: cardLimits[planName || 'Essentials'] || 5,
      }).catch((error) => {
        console.error('Failed to send subscription started email:', error);
      });
    }
  } else if (status === 'canceled' || status === 'unpaid' || status === 'trialing') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  // Only process one-time payments (card credits)
  if (session.mode !== 'payment') {
    return;
  }

  const teamId = session.metadata?.teamId;
  const productType = session.metadata?.productType;

  if (!teamId || productType !== 'cardCredit') {
    console.log('Not a card credit purchase, skipping');
    return;
  }

  // Verify payment was successful
  if (session.payment_status !== 'paid') {
    console.error('Payment not completed for session:', session.id);
    return;
  }

  // Get the price ID from the session to determine how many credits to add
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id;

  // Find matching product and add credits
  const cardCreditProduct = STRIPE_ONE_TIME_PRODUCTS.cardCredit;
  
  if (priceId === cardCreditProduct.priceId) {
    try {
      await addCardCredits(parseInt(teamId), cardCreditProduct.creditsAdded);
      console.log(`Added ${cardCreditProduct.creditsAdded} card credit(s) to team ${teamId}`);

      // Get team owner and send card credit purchased email
      const { db } = await import('@/lib/db/drizzle');
      const { users, teamMembers, teams } = await import('@/lib/db/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const teamData = await db
        .select({ user: users, team: teams })
        .from(teamMembers)
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(and(eq(teamMembers.teamId, parseInt(teamId)), eq(teamMembers.role, 'owner')))
        .limit(1);

      if (teamData.length > 0) {
        const { sendCardCreditPurchasedEmail } = await import('@/lib/email');
        sendCardCreditPurchasedEmail({
          user: teamData[0].user,
          creditsAdded: cardCreditProduct.creditsAdded,
          totalCredits: teamData[0].team.cardCredits || 0,
        }).catch((error) => {
          console.error('Failed to send card credit purchased email:', error);
        });
      }
    } catch (error) {
      console.error('Error adding card credits:', error);
    }
  } else {
    console.error('Unknown price ID:', priceId);
  }
}
