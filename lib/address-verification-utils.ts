import { validateAddress } from './address-validation';
import { Occasion, Recipient } from './db/schema';

/**
 * Calculate days until an occasion
 * Returns number of days from today to the next occurrence
 */
export function getDaysUntilOccasion(occasion: typeof Occasion.$inferSelect): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (occasion.isJustBecause && occasion.computedSendDate) {
    // Just Because uses pre-computed send date
    const targetDate = new Date(occasion.computedSendDate);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // Regular occasions - calculate next occurrence
    const occasionDate = new Date(occasion.occasionDate);
    const currentYear = today.getFullYear();
    
    // Create date for this year
    let nextOccurrence = new Date(
      currentYear,
      occasionDate.getMonth(),
      occasionDate.getDate()
    );
    
    // If already passed this year, use next year
    if (nextOccurrence < today) {
      nextOccurrence.setFullYear(currentYear + 1);
    }
    
    return Math.ceil((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}

/**
 * Verify address immediately for urgent occasions (within 15 days)
 * Returns verification result and whether action is needed
 */
export async function verifyAddressIfUrgent(
  recipientAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
  },
  occasions: Array<typeof Occasion.$inferSelect>
): Promise<{
  isUrgent: boolean;
  daysUntil: number | null;
  verification: Awaited<ReturnType<typeof validateAddress>> | null;
  urgentOccasions: Array<typeof Occasion.$inferSelect>;
}> {
  // Find occasions that are within 15 days
  const urgentOccasions = occasions.filter(occasion => {
    const days = getDaysUntilOccasion(occasion);
    return days <= 15 && days >= 0;
  });

  if (urgentOccasions.length === 0) {
    return {
      isUrgent: false,
      daysUntil: null,
      verification: null,
      urgentOccasions: [],
    };
  }

  // Get the soonest occasion
  const soonestDays = Math.min(...urgentOccasions.map(getDaysUntilOccasion));

  console.log(`[ADDRESS VERIFY] Urgent: ${urgentOccasions.length} occasion(s) in ${soonestDays} days`);

  // Verify the address
  const verification = await validateAddress({
    street: recipientAddress.street,
    apartment: recipientAddress.apartment,
    city: recipientAddress.city,
    state: recipientAddress.state,
    zip: recipientAddress.zip,
  });

  return {
    isUrgent: true,
    daysUntil: soonestDays,
    verification,
    urgentOccasions,
  };
}

/**
 * Determine address status based on verification result
 */
export function getAddressStatus(verification: Awaited<ReturnType<typeof validateAddress>>): {
  status: 'verified' | 'corrected' | 'invalid' | 'error';
  notes: string | null;
} {
  switch (verification.verdict) {
    case 'VALID':
      return {
        status: 'verified',
        notes: null,
      };
    
    case 'CORRECTABLE':
      return {
        status: 'corrected',
        notes: 'Address was standardized by USPS',
      };
    
    case 'UNDELIVERABLE':
      return {
        status: 'invalid',
        notes: verification.message || 'Address could not be verified by USPS',
      };
    
    case 'ERROR':
    default:
      return {
        status: 'error',
        notes: verification.message || 'Unable to verify address - will retry before shipping',
      };
  }
}

/**
 * Format address for display
 */
export function formatAddress(address: {
  street: string;
  apartment?: string | null;
  city: string;
  state: string;
  zip: string;
}): string {
  const parts = [
    address.street,
    address.apartment,
    `${address.city}, ${address.state} ${address.zip}`,
  ].filter(Boolean);
  
  return parts.join('\n');
}

