import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { recipients, occasions, orders, users, teamMembers, teams, userAddresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { deductCardCredit } from '@/lib/db/queries';

/**
 * POST /api/just-because/apply-credit
 * Applies a card credit to a Just Because occasion by creating an order immediately
 * Body: { occasionId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { occasionId } = body;

    if (!occasionId || typeof occasionId !== 'number') {
      return NextResponse.json({ error: 'Invalid occasion ID' }, { status: 400 });
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

    // Get user's team
    const userTeam = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, dbUser[0].id))
      .limit(1);

    if (userTeam.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const team = userTeam[0].team;

    // Check if team has sufficient credits
    if (!team.cardCredits || team.cardCredits < 1) {
      return NextResponse.json({ error: 'Insufficient card credits' }, { status: 400 });
    }

    // Get the occasion with recipient info
    const occasionData = await db
      .select({
        occasion: occasions,
        recipient: recipients,
      })
      .from(occasions)
      .innerJoin(recipients, eq(occasions.recipientId, recipients.id))
      .where(
        and(
          eq(occasions.id, occasionId),
          eq(occasions.isJustBecause, true),
          eq(recipients.userId, dbUser[0].id)
        )
      )
      .limit(1);

    if (occasionData.length === 0) {
      return NextResponse.json({ error: 'Just Because occasion not found' }, { status: 404 });
    }

    const { occasion, recipient } = occasionData[0];

    // Check if there's already a pending or completed order for this occasion
    const existingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.occasionId, occasionId),
          eq(orders.recipientId, recipient.id)
        )
      )
      .limit(1);

    if (existingOrders.length > 0) {
      return NextResponse.json(
        { error: 'An order already exists for this Just Because occasion' },
        { status: 400 }
      );
    }

    // Get user's default return address
    const defaultAddress = await db
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.userId, dbUser[0].id),
          eq(userAddresses.isDefault, 1)
        )
      )
      .limit(1);

    if (defaultAddress.length === 0) {
      return NextResponse.json(
        { error: 'No default return address found. Please add a return address in your account settings.' },
        { status: 400 }
      );
    }

    const returnAddr = defaultAddress[0];

    // Create an order immediately (using the credit)
    const newOrder = {
      recipientId: recipient.id,
      occasionId: occasion.id,
      userId: dbUser[0].id,
      teamId: team.id,
      cardType: 'subscription' as const,
      occasionDate: occasion.occasionDate,
      status: 'pending' as const,
      
      // Recipient address
      recipientFirstName: recipient.firstName,
      recipientLastName: recipient.lastName,
      recipientStreet: recipient.street,
      recipientApartment: recipient.apartment || null,
      recipientCity: recipient.city,
      recipientState: recipient.state,
      recipientZip: recipient.zip,
      
      // Return address
      returnName: `${dbUser[0].firstName || ''} ${dbUser[0].lastName || ''}`.trim() || dbUser[0].email,
      returnStreet: returnAddr.street,
      returnApartment: returnAddr.apartment || null,
      returnCity: returnAddr.city,
      returnState: returnAddr.state,
      returnZip: returnAddr.zip,
      
      // Occasion details
      occasionType: occasion.occasionType,
      occasionNotes: occasion.notes || null,
    };

    const [createdOrder] = await db.insert(orders).values(newOrder).returning();

    // Deduct the credit
    await deductCardCredit(team.id);

    console.log(`[Just Because] Credit applied to occasion ${occasionId}, order ${createdOrder.id} created`);

    return NextResponse.json({
      success: true,
      order: createdOrder,
      remainingCredits: (team.cardCredits || 0) - 1,
    });
  } catch (error) {
    console.error('Error applying credit to Just Because:', error);
    
    if (error instanceof Error && error.message === 'Insufficient card credits') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

