import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createReminderFromPendingData } from '@/lib/pending-reminder-handler';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/pending-reminder
 * Processes a pending reminder saved during unauthenticated flow
 * Called after user successfully signs up
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending data from request
    const body = await req.json();
    const { pendingData } = body;

    if (!pendingData || !pendingData.recipient || !pendingData.occasions) {
      return NextResponse.json({ error: 'Invalid pending data' }, { status: 400 });
    }

    // Get user's database ID from their email
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email!))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    console.log('[API] Processing pending reminder for user:', dbUser.id);

    // Create the reminder from pending data
    const result = await createReminderFromPendingData(dbUser.id, pendingData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recipientId: result.recipientId,
      message: 'Reminder created successfully'
    });
  } catch (error) {
    console.error('[API] Error processing pending reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

