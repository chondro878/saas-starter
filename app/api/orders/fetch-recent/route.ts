import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { orders, occasions, recipients, users, teamMembers } from '@/lib/db/schema';
import { and, sql, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Look for occasions in the next 30 days that don't have orders yet
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);

    // Get current year to construct dates for comparison
    const currentYear = today.getFullYear();

    // Get upcoming occasions that need orders
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
        sql`
          MAKE_DATE(
            ${currentYear},
            EXTRACT(MONTH FROM ${occasions.occasionDate})::integer,
            EXTRACT(DAY FROM ${occasions.occasionDate})::integer
          ) BETWEEN ${today} AND ${endDate}
        `
      );

    const createdOrders = [];
    const skippedOrders = [];

    for (const item of upcomingOccasions) {
      // Check if order already exists for this occasion
      const existingOrder = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.occasionId, item.occasion.id),
            eq(orders.recipientId, item.recipient.id)
          )
        )
        .limit(1);

      if (existingOrder.length > 0) {
        skippedOrders.push({
          reason: 'Order already exists',
          recipientName: `${item.recipient.firstName} ${item.recipient.lastName}`,
        });
        continue;
      }

      // Get user's default address (first address or null)
      const userAddress = item.user.defaultAddressId 
        ? await db.query.addresses.findFirst({
            where: (addresses, { eq }) => eq(addresses.id, item.user.defaultAddressId!),
          })
        : null;

      if (!userAddress) {
        skippedOrders.push({
          reason: 'No default address',
          recipientName: `${item.recipient.firstName} ${item.recipient.lastName}`,
        });
        continue;
      }

      // Create the order
      const newOrder = await db.insert(orders).values({
        recipientId: item.recipient.id,
        occasionId: item.occasion.id,
        userId: item.user.id,
        teamId: item.teamId,
        cardType: 'subscription',
        occasionDate: item.occasion.occasionDate,
        status: 'pending',
        recipientFirstName: item.recipient.firstName,
        recipientLastName: item.recipient.lastName,
        recipientStreet: item.recipient.street,
        recipientApartment: item.recipient.apartment || '',
        recipientCity: item.recipient.city,
        recipientState: item.recipient.state,
        recipientZip: item.recipient.zip,
        returnName: `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || 'Return Address',
        returnStreet: userAddress.street,
        returnApartment: userAddress.apartment || '',
        returnCity: userAddress.city,
        returnState: userAddress.state,
        returnZip: userAddress.zip,
        occasionType: item.occasion.occasionType,
        occasionNotes: item.occasion.notes || null,
      }).returning();

      createdOrders.push(newOrder[0]);
    }

    return NextResponse.json({
      success: true,
      created: createdOrders.length,
      skipped: skippedOrders.length,
      orders: createdOrders,
      skippedDetails: skippedOrders,
    });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    );
  }
}

