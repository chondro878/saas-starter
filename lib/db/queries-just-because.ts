import { db } from './drizzle';
import { occasions, recipients } from './schema';
import { eq, and } from 'drizzle-orm';

/**
 * Check if a recipient already has a Just Because occasion
 * Enforces 1 per recipient limit
 */
export async function hasJustBecauseOccasion(recipientId: number): Promise<boolean> {
  const existing = await db
    .select()
    .from(occasions)
    .where(
      and(
        eq(occasions.recipientId, recipientId),
        eq(occasions.isJustBecause, true)
      )
    )
    .limit(1);
  
  return existing.length > 0;
}

/**
 * Get Just Because occasion for a recipient
 */
export async function getJustBecauseOccasion(recipientId: number) {
  const result = await db
    .select()
    .from(occasions)
    .where(
      and(
        eq(occasions.recipientId, recipientId),
        eq(occasions.isJustBecause, true)
      )
    )
    .limit(1);
  
  return result[0] || null;
}

