import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { recipients, occasions, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/just-because/recipients
 * Returns all recipients that have Just Because occasions
 * Used for the "Apply Credit to Just Because" dropdown
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email!))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all recipients with Just Because occasions
    const justBecauseRecipients = await db
      .select({
        recipient: recipients,
        occasion: occasions
      })
      .from(recipients)
      .innerJoin(occasions, eq(occasions.recipientId, recipients.id))
      .where(
        and(
          eq(recipients.userId, dbUser[0].id),
          eq(occasions.isJustBecause, true)
        )
      );

    // Transform to a cleaner format
    const formatted = justBecauseRecipients.map(({ recipient, occasion }) => ({
      id: recipient.id,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      partnerFirstName: recipient.partnerFirstName,
      partnerLastName: recipient.partnerLastName,
      relationship: recipient.relationship,
      occasionId: occasion.id,
      cardVariation: occasion.cardVariation,
      computedSendDate: occasion.computedSendDate,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching Just Because recipients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

