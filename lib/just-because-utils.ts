/**
 * Client-safe utility functions for Just Because feature
 * These don't require database access and can be used in client components
 */

/**
 * Get card variation based on relationship type
 */
export function getCardVariation(relationship: string): string {
  const rel = relationship.toLowerCase();
  switch (rel) {
    case 'friend':
    case 'family':
      return 'thinking_of_you';
    case 'romantic':
      return 'romantic';
    case 'professional':
      return 'recognition';
    default:
      return 'thinking_of_you';
  }
}

/**
 * Get display label for Just Because card based on relationship
 */
export function getJustBecauseLabel(relationship: string): string {
  const rel = relationship.toLowerCase();
  switch (rel) {
    case 'friend':
    case 'family':
      return 'Thinking of You';
    case 'romantic':
      return 'Romantic';
    case 'professional':
      return 'Recognition';
    default:
      return 'Just Because';
  }
}

