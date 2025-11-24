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
    const currentYear = new Date().getFullYear();

    console.log(`[CRON] Looking for occasions on ${targetMonth}/${targetDay}`);

    // Find regular occasions happening on this date
    const regularOccasions = await db
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
          eq(occasions.isJustBecause, false), // Regular occasions only
          sql`EXTRACT(MONTH FROM ${occasions.occasionDate}) = ${targetMonth}`,
          sql`EXTRACT(DAY FROM ${occasions.occasionDate}) = ${targetDay}`
        )
      );

    // Find Just Because occasions with computed dates matching target
    const justBecauseOccasions = await db
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
          eq(occasions.isJustBecause, true),
          sql`EXTRACT(MONTH FROM ${occasions.computedSendDate}) = ${targetMonth}`,
          sql`EXTRACT(DAY FROM ${occasions.computedSendDate}) = ${targetDay}`,
          // Only if not sent this year yet
          sql`(${occasions.lastSentYear} IS NULL OR ${occasions.lastSentYear} < ${currentYear})`
        )
      );

    const upcomingOccasions = [...regularOccasions, ...justBecauseOccasions];
    console.log(`[CRON] Found ${upcomingOccasions.length} upcoming occasions (${regularOccasions.length} regular, ${justBecauseOccasions.length} Just Because)`);

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
        
        // Send missing address email
        const { sendMissingAddressEmail } = await import('@/lib/email');
        const occasionDate = new Date(item.occasion.occasionDate);
        sendMissingAddressEmail({
          user: item.user,
          recipientName: `${item.recipient.firstName} ${item.recipient.lastName}`,
          occasionType: item.occasion.occasionType,
          occasionDate: occasionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        }).catch((error) => {
          console.error('[CRON] Failed to send missing address email:', error);
        });
        
        continue;
      }

      const returnAddr = defaultAddress[0];

      // Verify recipient address before creating order
      const { validateAddress } = await import('@/lib/address-validation');
      const { sendUrgentAddressIssueEmail } = await import('@/lib/email/send-address-emails');
      
      const addressVerification = await validateAddress({
        street: item.recipient.street,
        apartment: item.recipient.apartment || undefined,
        city: item.recipient.city,
        state: item.recipient.state,
        zip: item.recipient.zip,
      });

      if (addressVerification.verdict === 'UNDELIVERABLE') {
        // Address is invalid - flag recipient and skip order creation
        await db.update(recipients).set({
          addressStatus: 'invalid',
          addressNotes: addressVerification.message || 'Address could not be verified by USPS',
          addressVerifiedAt: new Date(),
        }).where(eq(recipients.id, item.recipient.id));
        
        // Send urgent email to user
        const occasionDate = new Date(item.occasion.occasionDate);
        await sendUrgentAddressIssueEmail({
          userEmail: item.user.email,
          userName: item.user.firstName || item.user.name || 'there',
          recipientName: `${item.recipient.firstName} ${item.recipient.lastName}`,
          occasionType: item.occasion.occasionType,
          occasionDate: occasionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          daysUntil: 15, // Since cron runs 15 days before
          address: {
            street: item.recipient.street,
            apartment: item.recipient.apartment,
            city: item.recipient.city,
            state: item.recipient.state,
            zip: item.recipient.zip,
          },
        }).catch(err => console.error('[CRON EMAIL ERROR]', err));
        
        skippedOrders.push(`Invalid address for recipient ${item.recipient.id} - user notified`);
        continue;
        
      } else if (addressVerification.verdict === 'CORRECTABLE' && addressVerification.suggestedAddress) {
        // Auto-correct the address
        const suggested = addressVerification.suggestedAddress;
        await db.update(recipients).set({
          street: suggested.street,
          apartment: suggested.apartment,
          city: suggested.city,
          state: suggested.state,
          zip: suggested.zip,
          addressStatus: 'corrected',
          addressNotes: 'Address standardized by USPS',
          addressVerifiedAt: new Date(),
        }).where(eq(recipients.id, item.recipient.id));
        
        console.log(`[CRON] Auto-corrected address for recipient ${item.recipient.id}`);
        
        // Update item.recipient to use corrected address for order creation
        item.recipient.street = suggested.street;
        item.recipient.apartment = suggested.apartment || null;
        item.recipient.city = suggested.city;
        item.recipient.state = suggested.state;
        item.recipient.zip = suggested.zip;
        
      } else if (addressVerification.verdict === 'VALID') {
        // Mark as verified
        await db.update(recipients).set({
          addressStatus: 'verified',
          addressVerifiedAt: new Date(),
        }).where(eq(recipients.id, item.recipient.id));
        
        console.log(`[CRON] Address verified for recipient ${item.recipient.id}`);
      }
      // If ERROR verdict, proceed anyway and mark as error status
      else if (addressVerification.verdict === 'ERROR') {
        await db.update(recipients).set({
          addressStatus: 'error',
          addressNotes: addressVerification.message || 'Verification service unavailable',
        }).where(eq(recipients.id, item.recipient.id));
        
        console.log(`[CRON] Address verification error for recipient ${item.recipient.id} - proceeding anyway`);
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

      // If it's a Just Because occasion, update lastSentYear
      if (item.occasion.isJustBecause) {
        await db
          .update(occasions)
          .set({ lastSentYear: currentYear })
          .where(eq(occasions.id, item.occasion.id));
        
        console.log(`[CRON] Updated Just Because lastSentYear for occasion ${item.occasion.id}`);
      }

      // Send order created email (don't await to avoid blocking cron)
      const { sendOrderCreatedEmail } = await import('@/lib/email');
      const occasionDate = new Date(item.occasion.occasionDate);
      const today = new Date();
      const daysUntilOccasion = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      sendOrderCreatedEmail({
        user: item.user,
        order: newOrder[0],
        occasionDate: occasionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        daysUntilOccasion,
      }).catch((error) => {
        console.error('[CRON] Failed to send order created email:', error);
      });
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

