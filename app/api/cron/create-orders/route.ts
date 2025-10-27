import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { orders, occasions, recipients, users, teams, teamMembers, userAddresses } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate target date (15 days from now)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 15);

    // Get all occasions that match the target date (month & day)
    const targetMonth = targetDate.getMonth() + 1;
    const targetDay = targetDate.getDate();

    console.log(`[CRON] Looking for occasions on ${targetMonth}/${targetDay}`);

    // Find all occasions happening on this date
    const upcomingOccasions = await db
      .select({
        occasion: occasions,
        recipient: recipients,
        user: users,
        teamId: teamMembers.teamId,
      })
      .from(occasions)
      .innerJoin(recipients, eq(occasions.recipientId, recipients.id))
      .innerJoin(users, eq(recipients.userId, users.id))
      .innerJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(
          sql`EXTRACT(MONTH FROM ${occasions.occasionDate}) = ${targetMonth}`,
          sql`EXTRACT(DAY FROM ${occasions.occasionDate}) = ${targetDay}`
        )
      );

    console.log(`[CRON] Found ${upcomingOccasions.length} upcoming occasions`);

    const createdOrders = [];
    const skippedOrders = [];

    for (const item of upcomingOccasions) {
      // Check if order already exists for this occasion this year
      const existingOrder = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.occasionId, item.occasion.id),
            sql`EXTRACT(YEAR FROM ${orders.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`
          )
        )
        .limit(1);

      if (existingOrder.length > 0) {
        skippedOrders.push(`Order already exists for occasion ${item.occasion.id}`);
        continue;
      }

      // Get team details
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, item.teamId))
        .limit(1);

      if (team.length === 0 || team[0].subscriptionStatus !== 'active') {
        skippedOrders.push(`No active subscription for user ${item.user.id}`);
        continue;
      }

      // Check card limit based on plan
      const cardLimits: Record<string, number> = {
        'Essentials': 5,
        'Stress Free': 12,
        'Concierge': 25,
      };

      const planName = team[0].planName || 'Essentials';
      const yearlyLimit = cardLimits[planName] || 5;

      // Count subscription orders created this year for this user (exclude bulk and individual)
      const ordersThisYear = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.userId, item.user.id),
            eq(orders.cardType, 'subscription'),
            sql`EXTRACT(YEAR FROM ${orders.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`,
            sql`${orders.status} != 'cancelled'`
          )
        );

      const orderCount = Number(ordersThisYear[0]?.count || 0);

      if (orderCount >= yearlyLimit) {
        skippedOrders.push(`User ${item.user.id} has reached card limit (${orderCount}/${yearlyLimit})`);
        continue;
      }

      // Get user's default return address
      const defaultAddress = await db
        .select()
        .from(userAddresses)
        .where(
          and(
            eq(userAddresses.userId, item.user.id),
            eq(userAddresses.isDefault, 1)
          )
        )
        .limit(1);

      if (defaultAddress.length === 0) {
        skippedOrders.push(`No default address for user ${item.user.id}`);
        continue;
      }

      const returnAddr = defaultAddress[0];

      // Create the order
      const newOrder = await db.insert(orders).values({
        recipientId: item.recipient.id,
        occasionId: item.occasion.id,
        userId: item.user.id,
        teamId: item.teamId,
        cardType: 'subscription',
        occasionDate: item.occasion.occasionDate,
        status: 'pending',
        
        // Recipient address
        recipientFirstName: item.recipient.firstName,
        recipientLastName: item.recipient.lastName,
        recipientStreet: item.recipient.street,
        recipientApartment: item.recipient.apartment || null,
        recipientCity: item.recipient.city,
        recipientState: item.recipient.state,
        recipientZip: item.recipient.zip,
        
        // Return address
        returnName: `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || item.user.email,
        returnStreet: returnAddr.street,
        returnApartment: returnAddr.apartment || null,
        returnCity: returnAddr.city,
        returnState: returnAddr.state,
        returnZip: returnAddr.zip,
        
        // Occasion details
        occasionType: item.occasion.occasionType,
        occasionNotes: item.occasion.notes || null,
      }).returning();

      createdOrders.push(newOrder[0]);
      console.log(`[CRON] Created order ${newOrder[0].id} for ${item.recipient.firstName} ${item.recipient.lastName}`);
    }

    console.log(`[CRON] Created ${createdOrders.length} orders, skipped ${skippedOrders.length}`);

    return NextResponse.json({
      success: true,
      created: createdOrders.length,
      skipped: skippedOrders.length,
      details: {
        createdOrders: createdOrders.map(o => ({ id: o.id, recipient: `${o.recipientFirstName} ${o.recipientLastName}` })),
        skippedReasons: skippedOrders,
      }
    });

  } catch (error) {
    console.error('[CRON] Error creating orders:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

