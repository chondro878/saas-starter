import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { recipients, occasions } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calculateJustBecauseDate } from '@/lib/just-because-scheduler';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { users } = await import('@/lib/db/schema');
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email!))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all recipients with their occasions
    const userRecipients = await db
      .select()
      .from(recipients)
      .where(eq(recipients.userId, dbUser[0].id))
      .orderBy(desc(recipients.createdAt));

    // Get occasions and lock status for each recipient
    const { orders } = await import('@/lib/db/schema');
    const recipientsWithOccasions = await Promise.all(
      userRecipients.map(async (recipient) => {
        const recipientOccasions = await db
          .select()
          .from(occasions)
          .where(eq(occasions.recipientId, recipient.id))
          .orderBy(asc(occasions.occasionDate));
        
        // Check if recipient has any orders in fulfillment (pending or printed)
        const inProcessOrders = await db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.recipientId, recipient.id),
              inArray(orders.status, ['pending', 'printed'])
            )
          );
        
        return {
          ...recipient,
          occasions: recipientOccasions,
          isLocked: inProcessOrders.length > 0,
          inProcessOrderCount: inProcessOrders.length,
        };
      })
    );

    return NextResponse.json(recipientsWithOccasions);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    // Get user from database
    const { users } = await import('@/lib/db/schema');
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email!))
      .limit(1);

    if (dbUser.length === 0) {
      console.error('User not found in database:', supabaseUser.email);
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    const body = await request.json();
    const { recipientData, occasionsData } = body;

    if (!recipientData) {
      return NextResponse.json({ error: 'Missing recipient data' }, { status: 400 });
    }

    // Create recipient
    const [newRecipient] = await db
      .insert(recipients)
      .values({
        ...recipientData,
        userId: dbUser[0].id,
      })
      .returning();

    // Create occasions if provided
    if (occasionsData && occasionsData.length > 0) {
      // Validate and format occasion dates
      const formattedOccasions = await Promise.all(occasionsData.map(async (occasion: any) => {
        const isJustBecause = occasion.isJustBecause === true;
        
        if (isJustBecause) {
          // Calculate random date for Just Because
          const computedDate = await calculateJustBecauseDate(newRecipient.id);
          
          return {
            occasionType: occasion.type || occasion.occasionType,
            occasionDate: new Date(), // Placeholder
            notes: occasion.notes || '',
            recipientId: newRecipient.id,
            isJustBecause: true,
            computedSendDate: computedDate,
            cardVariation: occasion.cardVariation || 'thinking_of_you',
            lastSentYear: null,
          };
        } else {
          // Regular occasion
          const dateValue = occasion.date || occasion.occasionDate;
          const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
          
          if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid date for occasion: ${occasion.type || occasion.occasionType}`);
          }
          
          return {
            occasionType: occasion.type || occasion.occasionType,
            occasionDate: dateObj,
            notes: occasion.notes || '',
            recipientId: newRecipient.id,
            isJustBecause: false,
            computedSendDate: null,
            cardVariation: null,
            lastSentYear: null,
          };
        }
      }));
      
      const insertedOccasions = await db.insert(occasions).values(formattedOccasions).returning();
      
      // Check if any occasions are within 15 days (urgent verification needed)
      const { verifyAddressIfUrgent } = await import('@/lib/address-verification-utils');
      const { sendUrgentAddressIssueEmail, sendAddressCorrectedEmail } = await import('@/lib/email/send-address-emails');
      
      const urgencyCheck = await verifyAddressIfUrgent(
        {
          street: body.street,
          apartment: body.apartment,
          city: body.city,
          state: body.state,
          zip: body.zip,
        },
        insertedOccasions
      );

      if (urgencyCheck.isUrgent && urgencyCheck.verification) {
        const verification = urgencyCheck.verification;
        const soonestOccasion = urgencyCheck.urgentOccasions[0];
        
        console.log(`[URGENT VERIFY] Occasion in ${urgencyCheck.daysUntil} days - verdict: ${verification.verdict}`);
        
        if (verification.verdict === 'UNDELIVERABLE') {
          // Invalid address - flag and email user immediately
          await db.update(recipients).set({
            addressStatus: 'invalid',
            addressNotes: verification.message || 'Address could not be verified by USPS',
            addressVerifiedAt: new Date(),
          }).where(eq(recipients.id, newRecipient.id));
          
          // Send urgent email
          const occasionDate = soonestOccasion.isJustBecause 
            ? 'surprise date' 
            : new Date(soonestOccasion.occasionDate).toLocaleDateString();
          
          await sendUrgentAddressIssueEmail({
            userEmail: dbUser[0].email,
            userName: dbUser[0].firstName || dbUser[0].name || 'there',
            recipientName: `${body.firstName} ${body.lastName}`,
            occasionType: soonestOccasion.occasionType,
            occasionDate,
            daysUntil: urgencyCheck.daysUntil!,
            address: {
              street: body.street,
              apartment: body.apartment,
              city: body.city,
              state: body.state,
              zip: body.zip,
            },
          }).catch(err => console.error('[EMAIL ERROR]', err));
          
        } else if (verification.verdict === 'CORRECTABLE' && verification.suggestedAddress) {
          // Auto-correct address
          await db.update(recipients).set({
            street: verification.suggestedAddress.street,
            apartment: verification.suggestedAddress.apartment,
            city: verification.suggestedAddress.city,
            state: verification.suggestedAddress.state,
            zip: verification.suggestedAddress.zip,
            addressStatus: 'corrected',
            addressNotes: 'Address standardized by USPS',
            addressVerifiedAt: new Date(),
          }).where(eq(recipients.id, newRecipient.id));
          
          // Notify user of correction
          await sendAddressCorrectedEmail({
            userEmail: dbUser[0].email,
            userName: dbUser[0].firstName || dbUser[0].name || 'there',
            recipientName: `${body.firstName} ${body.lastName}`,
            originalAddress: {
              street: body.street,
              apartment: body.apartment,
              city: body.city,
              state: body.state,
              zip: body.zip,
            },
            correctedAddress: verification.suggestedAddress,
          }).catch(err => console.error('[EMAIL ERROR]', err));
          
        } else if (verification.verdict === 'VALID') {
          // Address is valid
          await db.update(recipients).set({
            addressStatus: 'verified',
            addressVerifiedAt: new Date(),
          }).where(eq(recipients.id, newRecipient.id));
        }
      }
      
      // Note: For non-urgent occasions (15+ days out), 
      // verification will happen in the cron job
    }

    return NextResponse.json(newRecipient, { status: 201 });
  } catch (error) {
    console.error('Error creating recipient:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

