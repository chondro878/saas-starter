import { db } from '@/lib/db/drizzle';
import { occasions, recipients } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { calculateHolidayDate } from './holiday-calculator';
import { getCardVariation } from './just-because-utils';

interface DateRange {
  start: Date;
  end: Date;
}

interface ExclusionWindow {
  date: Date;
  buffer: number; // days before and after to exclude
}

/**
 * Major holidays to avoid (these are fixed dates)
 */
const MAJOR_HOLIDAYS = [
  { month: 1, day: 1 },   // New Year's Day
  { month: 2, day: 14 },  // Valentine's Day
  { month: 3, day: 17 },  // St. Patrick's Day
  { month: 7, day: 4 },   // Independence Day
  { month: 10, day: 31 }, // Halloween
  { month: 12, day: 25 }, // Christmas
  { month: 12, day: 31 }, // New Year's Eve
];

const BUFFER_DAYS = 14; // 2 weeks before/after occasions and holidays

/**
 * Get all exclusion windows for a recipient
 */
async function getExclusionWindows(recipientId: number, currentYear: number): Promise<ExclusionWindow[]> {
  const exclusions: ExclusionWindow[] = [];
  
  // Get all recipient's occasions (birthdays, anniversaries)
  const recipientOccasions = await db
    .select()
    .from(occasions)
    .where(
      and(
        eq(occasions.recipientId, recipientId),
        eq(occasions.isJustBecause, false) // Exclude Just Because occasions
      )
    );

  // Add recipient occasions to exclusions
  for (const occasion of recipientOccasions) {
    const occasionDate = new Date(occasion.occasionDate);
    const thisYearDate = new Date(currentYear, occasionDate.getMonth(), occasionDate.getDate());
    exclusions.push({
      date: thisYearDate,
      buffer: BUFFER_DAYS,
    });
  }

  // Add major holidays
  for (const holiday of MAJOR_HOLIDAYS) {
    exclusions.push({
      date: new Date(currentYear, holiday.month - 1, holiday.day),
      buffer: BUFFER_DAYS,
    });
  }

  // Add dynamic holidays (Mother's Day, Father's Day, Easter, Thanksgiving)
  const mothersDayDate = calculateHolidayDate("Mother's Day");
  const fathersDayDate = calculateHolidayDate("Father's Day");
  const easterDate = calculateHolidayDate("Easter");
  const thanksgivingDate = calculateHolidayDate("Thanksgiving");

  if (mothersDayDate) exclusions.push({ date: mothersDayDate, buffer: BUFFER_DAYS });
  if (fathersDayDate) exclusions.push({ date: fathersDayDate, buffer: BUFFER_DAYS });
  if (easterDate) exclusions.push({ date: easterDate, buffer: BUFFER_DAYS });
  if (thanksgivingDate) exclusions.push({ date: thanksgivingDate, buffer: BUFFER_DAYS });

  return exclusions;
}

/**
 * Check if a date falls within any exclusion window
 */
function isDateExcluded(date: Date, exclusions: ExclusionWindow[]): boolean {
  for (const exclusion of exclusions) {
    const daysDiff = Math.abs(
      (date.getTime() - exclusion.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= exclusion.buffer) {
      return true;
    }
  }
  return false;
}

/**
 * Get all valid dates in a year (excluding exclusion windows)
 */
function getValidDates(year: number, exclusions: ExclusionWindow[]): Date[] {
  const validDates: Date[] = [];
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st
  
  // Must be at least 30 days from now for fulfillment
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 30);
  
  let currentDate = new Date(Math.max(startDate.getTime(), minDate.getTime()));
  
  while (currentDate <= endDate) {
    if (!isDateExcluded(currentDate, exclusions)) {
      validDates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return validDates;
}

/**
 * Calculate a random "Just Because" date for a recipient
 * Ensures it's at least 30 days away and avoids all occasions/holidays
 * SERVER-SIDE ONLY - requires database access
 */
export async function calculateJustBecauseDate(recipientId: number): Promise<Date> {
  const currentYear = new Date().getFullYear();
  const exclusions = await getExclusionWindows(recipientId, currentYear);
  const validDates = getValidDates(currentYear, exclusions);
  
  if (validDates.length === 0) {
    // Fallback: if somehow no valid dates (shouldn't happen), use mid-year
    return new Date(currentYear, 6, 15); // July 15
  }
  
  // Select random date from valid dates
  const randomIndex = Math.floor(Math.random() * validDates.length);
  return validDates[randomIndex];
}

/**
 * Recalculate Just Because date when a new occasion is added
 * Called when a birthday or anniversary is added/updated
 * SERVER-SIDE ONLY - requires database access
 */
export async function rescheduleJustBecauseIfNeeded(recipientId: number): Promise<void> {
  // Get the recipient's Just Because occasion
  const justBecauseOccasions = await db
    .select()
    .from(occasions)
    .where(
      and(
        eq(occasions.recipientId, recipientId),
        eq(occasions.isJustBecause, true)
      )
    );
  
  if (justBecauseOccasions.length === 0) {
    return; // No Just Because to reschedule
  }
  
  const justBecause = justBecauseOccasions[0];
  const currentComputedDate = justBecause.computedSendDate;
  
  if (!currentComputedDate) {
    return; // No date to check
  }
  
  // Check if current date is still valid
  const currentYear = new Date().getFullYear();
  const exclusions = await getExclusionWindows(recipientId, currentYear);
  
  if (isDateExcluded(new Date(currentComputedDate), exclusions)) {
    // Date is now excluded, recalculate
    const newDate = await calculateJustBecauseDate(recipientId);
    
    await db
      .update(occasions)
      .set({ computedSendDate: newDate })
      .where(eq(occasions.id, justBecause.id));
    
    console.log(`[Just Because] Rescheduled for recipient ${recipientId}: ${newDate}`);
  }
}

// Re-export the utility function for convenience
export { getCardVariation };

