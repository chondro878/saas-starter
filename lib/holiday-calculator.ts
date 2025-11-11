/**
 * Holiday Date Calculator
 * 
 * Provides utilities for calculating exact dates of holidays,
 * including variable holidays like Easter, Mother's Day, Father's Day, and Thanksgiving.
 */

/**
 * Gets the Nth occurrence of a specific day of the week in a given month
 * @param year - The year
 * @param month - The month (0-11, where 0 is January)
 * @param dayOfWeek - Day of week (0-6, where 0 is Sunday)
 * @param occurrence - Which occurrence (1 for first, 2 for second, etc.)
 * @example getNthDayOfMonth(2025, 4, 0, 2) // 2nd Sunday of May 2025
 */
export function getNthDayOfMonth(
    year: number,
    month: number,
    dayOfWeek: number,
    occurrence: number
): Date {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    // Calculate the first occurrence of the target day
    let firstOccurrence = 1 + ((dayOfWeek - firstDayOfWeek + 7) % 7);

    // Calculate the nth occurrence
    const targetDay = firstOccurrence + (occurrence - 1) * 7;

    return new Date(year, month, targetDay);
}

/**
 * Calculates Easter Sunday using the Anonymous Gregorian algorithm (Computus)
 * This algorithm has been used since the 16th century and is accurate for all Gregorian calendar years.
 * 
 * @param year - The year to calculate Easter for
 * @returns Date object representing Easter Sunday
 * @see https://en.wikipedia.org/wiki/Computus#Anonymous_Gregorian_algorithm
 */
export function calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // JS months are 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month, day);
}

/**
 * List of variable holidays that need year-specific calculation
 */
export const VARIABLE_HOLIDAYS = [
    "Easter",
    "Mother's Day",
    "Father's Day",
    "Thanksgiving"
] as const;

/**
 * Checks if a holiday name is a variable holiday (date changes each year)
 */
export function isVariableHoliday(holidayName: string): boolean {
    return VARIABLE_HOLIDAYS.includes(holidayName as any);
}

/**
 * Calculates the date for a holiday in a specific year
 * @param holidayName - Name of the holiday
 * @param year - The year to calculate for
 * @returns Date object for the holiday in the specified year
 */
export function calculateHolidayForYear(holidayName: string, year: number): Date {
    switch (holidayName) {
        case "New Year's":
            return new Date(year, 0, 1); // January 1

        case "Valentine's Day":
            return new Date(year, 1, 14); // February 14

        case "St. Patrick's Day":
            return new Date(year, 2, 17); // March 17

        case "Easter":
            return calculateEaster(year);

        case "Mother's Day":
            // 2nd Sunday of May
            return getNthDayOfMonth(year, 4, 0, 2);

        case "Father's Day":
            // 3rd Sunday of June
            return getNthDayOfMonth(year, 5, 0, 3);

        case "Independence Day":
            return new Date(year, 6, 4); // July 4

        case "Halloween":
            return new Date(year, 9, 31); // October 31

        case "Thanksgiving":
            // 4th Thursday of November
            return getNthDayOfMonth(year, 10, 4, 4);

        case "Christmas":
            return new Date(year, 11, 25); // December 25

        default:
            // Default to January 1 if unknown holiday
            console.warn(`Unknown holiday: ${holidayName}`);
            return new Date(year, 0, 1);
    }
}

/**
 * Calculates the date for a given holiday, using this year or next year
 * depending on whether the holiday has already passed.
 * 
 * @param holidayName - Name of the holiday
 * @returns Date object for the next occurrence of the holiday
 * @example
 * // If it's December 2024 and you call calculateHolidayDate("Mother's Day")
 * // Returns May 11, 2025 (because Mother's Day 2024 has passed)
 */
export function calculateHolidayDate(holidayName: string): Date {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Calculate for current year first
    const holidayThisYear = calculateHolidayForYear(holidayName, currentYear);

    // If holiday has passed this year, use next year
    if (holidayThisYear < today) {
        return calculateHolidayForYear(holidayName, currentYear + 1);
    }

    return holidayThisYear;
}

