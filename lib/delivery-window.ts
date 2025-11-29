// Delivery window utilities for occasion fulfillment
import { calculateHolidayDate } from './holiday-calculator';

export const DELIVERY_WINDOW_DAYS = 15;

/**
 * Calculate days until a given date from today
 */
export function getDaysUntilDate(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within the delivery window (>= 15 days away)
 */
export function isWithinDeliveryWindow(date: Date): boolean {
  const daysUntil = getDaysUntilDate(date);
  return daysUntil >= DELIVERY_WINDOW_DAYS;
}

/**
 * Get the year when an occasion will actually be fulfilled
 */
export function getNextFulfillableYear(date: Date): number {
  if (isWithinDeliveryWindow(date)) {
    return date.getFullYear();
  }
  return date.getFullYear() + 1;
}

/**
 * Check if an occasion can be fulfilled this year or needs to be scheduled for next year
 * Handles both custom occasions (with user-selected dates) and holidays (with calculated dates)
 */
export function checkOccasionDeliveryStatus(
  occasionType: string,
  customDate?: Date
): {
  isTooSoon: boolean;
  daysUntil: number;
  fulfillmentDate: Date;
  fulfillmentYear: number;
} {
  let occasionDate: Date;
  
  // Determine the occasion date
  if (customDate) {
    // Custom occasion (Birthday, Anniversary)
    occasionDate = customDate;
  } else {
    // Holiday occasion - calculate the date
    occasionDate = calculateHolidayDate(occasionType);
  }
  
  const daysUntil = getDaysUntilDate(occasionDate);
  const isTooSoon = daysUntil < DELIVERY_WINDOW_DAYS && daysUntil >= 0;
  
  let fulfillmentDate = new Date(occasionDate);
  let fulfillmentYear = occasionDate.getFullYear();
  
  if (isTooSoon) {
    // Move to next year
    fulfillmentDate.setFullYear(fulfillmentDate.getFullYear() + 1);
    fulfillmentYear = fulfillmentDate.getFullYear();
  }
  
  return {
    isTooSoon,
    daysUntil,
    fulfillmentDate,
    fulfillmentYear,
  };
}

