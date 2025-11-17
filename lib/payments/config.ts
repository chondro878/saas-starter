// Stripe Product Configuration
// These should match your Stripe product IDs

export const STRIPE_PLANS = {
  essentials: {
    name: 'Essentials',
    description: 'For close family',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIALS || 'price_essentials',
    price: 4900, // $49.00
    interval: 'year',
    cardsPerYear: 5,
    recommended: false,
    features: [
      '5 cards per year',
      'Premium card designs',
      'Pre-stamped & addressed',
      'Delivered to your door',
      'Email reminders',
    ],
  },
  stressFree: {
    name: 'Stress Free',
    description: 'Most popular',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STRESS_FREE || 'price_stressfree',
    price: 9900, // $99.00
    interval: 'year',
    cardsPerYear: 12,
    features: [
      '12 cards per year',
      'Premium card designs',
      'Pre-stamped & addressed',
      'Delivered to your door',
      'Email reminders',
      'Holiday pack options',
      'Priority support',
    ],
    recommended: true,
  },
  concierge: {
    name: 'Concierge',
    description: 'Full service',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CONCIERGE || 'price_concierge',
    price: 19900, // $199.00
    interval: 'year',
    cardsPerYear: 25,
    recommended: false,
    features: [
      '25 cards per year',
      'Premium card designs',
      'Pre-stamped & addressed',
      'Delivered to your door',
      'Email reminders',
      'Holiday packs included',
      'AI-written messages',
      'Priority support',
      'Expedited shipping',
    ],
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;

export function getPlanByName(planName: string | null): PlanKey | null {
  if (!planName) return null;
  
  const normalized = planName.toLowerCase().replace(/\s+/g, '');
  
  if (normalized.includes('essential')) return 'essentials';
  if (normalized.includes('stress')) return 'stressFree';
  if (normalized.includes('concierge')) return 'concierge';
  
  return null;
}

export function getNextTier(currentPlan: PlanKey | null): PlanKey | null {
  if (!currentPlan || currentPlan === 'essentials') return 'stressFree';
  if (currentPlan === 'stressFree') return 'concierge';
  return null; // Already on highest tier
}

export function getPlanDetails(planKey: PlanKey) {
  return STRIPE_PLANS[planKey];
}

// One-time purchases
export const STRIPE_ONE_TIME_PRODUCTS = {
  cardCredit: {
    name: 'Single Card Credit',
    description: 'Add one extra card to your account',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CARD_CREDIT || 'price_card_credit',
    price: 1500, // $15.00
    creditsAdded: 1,
  },
} as const;

export type OneTimeProductKey = keyof typeof STRIPE_ONE_TIME_PRODUCTS;

