import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { occasions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateHolidayForYear, VARIABLE_HOLIDAYS, isVariableHoliday } from '@/lib/holiday-calculator';

/**
 * Yearly Cron Job - Update Variable Holiday Dates
 * 
 * Runs on January 1st each year to update the dates for variable holidays
 * (Easter, Mother's Day, Father's Day, Thanksgiving) to their correct dates
 * for the current year.
 * 
 * Schedule: January 1st at midnight (via vercel.json or cron service)
 * Endpoint: GET /api/cron/update-holiday-dates
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[CRON] Unauthorized access attempt to update-holiday-dates');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON] Starting holiday date update job...');

  try {
    const currentYear = new Date().getFullYear();
    const updatedOccasions = [];
    const errors = [];

    // Process each variable holiday type
    for (const holidayName of VARIABLE_HOLIDAYS) {
      try {
        // Calculate the correct date for this holiday in the current year
        const newDate = calculateHolidayForYear(holidayName, currentYear);
        
        console.log(`[CRON] Calculating ${holidayName} for ${currentYear}: ${newDate.toDateString()}`);

        // Find all occasions with this holiday type
        const result = await db
          .select()
          .from(occasions)
          .where(eq(occasions.occasionType, holidayName));

        console.log(`[CRON] Found ${result.length} occasions for ${holidayName}`);

        // Update each occasion to the new date
        for (const occasion of result) {
          await db
            .update(occasions)
            .set({ occasionDate: newDate })
            .where(eq(occasions.id, occasion.id));
          
          updatedOccasions.push({
            id: occasion.id,
            recipientId: occasion.recipientId,
            holidayName,
            oldDate: occasion.occasionDate,
            newDate: newDate.toISOString()
          });
        }

      } catch (error) {
        const errorMsg = `Failed to update ${holidayName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`[CRON] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[CRON] Holiday date update complete. Updated ${updatedOccasions.length} occasions.`);

    return NextResponse.json({
      success: true,
      year: currentYear,
      updated: updatedOccasions.length,
      errors: errors.length,
      details: {
        updatedOccasions: updatedOccasions.map(o => ({
          id: o.id,
          holiday: o.holidayName,
          newDate: o.newDate
        })),
        errors
      }
    });

  } catch (error) {
    console.error('[CRON] Error in holiday date update job:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

