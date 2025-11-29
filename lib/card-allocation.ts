import { Team } from './db/schema';

export interface CardAllocation {
  scheduledCards: number;
  subscriptionCards: number;
  extraCards: number;
  totalAvailable: number;
  shortfall: number;
  isOverLimit: boolean;
}

/**
 * Calculate how many cards a user has scheduled vs available
 * @param occasionCount - Total number of occasions scheduled
 * @param team - Team object with subscription and credit data
 * @returns CardAllocation breakdown
 */
export function calculateCardAllocation(
  occasionCount: number,
  team: Team | null
): CardAllocation {
  if (!team) {
    return {
      scheduledCards: occasionCount,
      subscriptionCards: 0,
      extraCards: 0,
      totalAvailable: 0,
      shortfall: occasionCount,
      isOverLimit: occasionCount > 0,
    };
  }

  // Determine subscription card limit based on plan
  let subscriptionCards = 0;
  if (team.stripeProductId) {
    // Map Stripe product IDs to card limits
    // This should match your Stripe price configurations
    const planLimits: Record<string, number> = {
      'prod_basic': 5,      // Basic plan: 5 cards/year
      'prod_pro': 15,       // Pro plan: 15 cards/year  
      'prod_concierge': 25, // Concierge: 25 cards/year
    };
    
    subscriptionCards = planLimits[team.stripeProductId] || 0;
  }

  const extraCards = team.cardCredits || 0;
  const totalAvailable = subscriptionCards + extraCards;
  const shortfall = Math.max(0, occasionCount - totalAvailable);
  const isOverLimit = occasionCount > totalAvailable;

  return {
    scheduledCards: occasionCount,
    subscriptionCards,
    extraCards,
    totalAvailable,
    shortfall,
    isOverLimit,
  };
}

/**
 * Get the cost for additional cards needed
 * @param cardCount - Number of cards to purchase
 * @returns Total cost in dollars
 */
export function calculateCardCost(cardCount: number): number {
  const CARD_PRICE = 9; // $9 per card
  return cardCount * CARD_PRICE;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

