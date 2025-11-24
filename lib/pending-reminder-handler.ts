'use server';

import { db } from '@/lib/db/drizzle';
import { recipients, occasions } from '@/lib/db/schema';
import { calculateJustBecauseDate } from '@/lib/just-because-scheduler';
import { getCardVariation } from '@/lib/just-because-utils';

interface PendingReminderData {
  recipient: {
    firstName: string;
    lastName: string;
    relationship: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    notes?: string;
  };
  occasions: Array<{
    type: string;
    date: string | null;
    notes?: string;
    isJustBecause: boolean;
  }>;
  timestamp: string;
  expiresAt: number;
}

/**
 * Create a reminder from pending data stored during unauthenticated signup
 * This is called after a user successfully creates an account
 */
export async function createReminderFromPendingData(
  userId: number,
  pendingData: PendingReminderData
): Promise<{ success: boolean; recipientId?: number; error?: string }> {
  try {
    // Check if data is expired (24 hours)
    if (Date.now() > pendingData.expiresAt) {
      console.log('[PENDING REMINDER] Data expired for user:', userId);
      return { success: false, error: 'Reminder data has expired' };
    }

    console.log('[PENDING REMINDER] Creating reminder for user:', userId);

    // Create recipient
    const [newRecipient] = await db.insert(recipients).values({
      userId: userId,
      firstName: pendingData.recipient.firstName,
      lastName: pendingData.recipient.lastName,
      relationship: pendingData.recipient.relationship,
      street: pendingData.recipient.street,
      apartment: pendingData.recipient.apartment || null,
      city: pendingData.recipient.city,
      state: pendingData.recipient.state,
      zip: pendingData.recipient.zip,
      country: pendingData.recipient.country,
      notes: pendingData.recipient.notes || null,
      addressStatus: 'pending', // Will be verified later by cron or if urgent
    }).returning();

    if (!newRecipient) {
      throw new Error('Failed to create recipient');
    }

    console.log('[PENDING REMINDER] Recipient created:', newRecipient.id);

    // Create occasions
    const occasionsToInsert = await Promise.all(
      pendingData.occasions.map(async (occasion) => {
        if (occasion.isJustBecause) {
          // Calculate Just Because date
          const selectedDate = await calculateJustBecauseDate(newRecipient.id);
          const cardVariation = getCardVariation(pendingData.recipient.relationship);

          return {
            recipientId: newRecipient.id,
            occasionType: 'JustBecause',
            occasionDate: new Date(), // Placeholder (not used for display)
            notes: occasion.notes || '',
            isJustBecause: true,
            computedSendDate: selectedDate,
            cardVariation,
            lastSentYear: null,
          };
        } else {
          // Regular occasion
          return {
            recipientId: newRecipient.id,
            occasionType: occasion.type,
            occasionDate: new Date(occasion.date!),
            notes: occasion.notes || '',
            isJustBecause: false,
            computedSendDate: null,
            cardVariation: null,
            lastSentYear: null,
          };
        }
      })
    );

    const insertedOccasions = await db.insert(occasions).values(occasionsToInsert).returning();

    console.log('[PENDING REMINDER] Created', insertedOccasions.length, 'occasions');

    // Check if any occasions are urgent (within 15 days) and verify address if needed
    const { verifyAddressIfUrgent } = await import('@/lib/address-verification-utils');
    const { sendUrgentAddressIssueEmail, sendAddressCorrectedEmail } = await import('@/lib/email/send-address-emails');
    const { users } = await import('@/lib/db/schema');
    const { eq } = await import('drizzle-orm');

    // Get user's email for notifications
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user) {
      const urgencyCheck = await verifyAddressIfUrgent(
        {
          street: pendingData.recipient.street,
          apartment: pendingData.recipient.apartment,
          city: pendingData.recipient.city,
          state: pendingData.recipient.state,
          zip: pendingData.recipient.zip,
        },
        insertedOccasions
      );

      if (urgencyCheck.isUrgent && urgencyCheck.verification) {
        const verification = urgencyCheck.verification;
        const soonestOccasion = urgencyCheck.urgentOccasions[0];

        console.log(`[PENDING REMINDER] Urgent occasion found - verifying address`);

        if (verification.verdict === 'UNDELIVERABLE') {
          // Invalid address - flag and email user
          await db.update(recipients).set({
            addressStatus: 'invalid',
            addressNotes: verification.message || 'Address could not be verified by USPS',
            addressVerifiedAt: new Date(),
          }).where(eq(recipients.id, newRecipient.id));

          const occasionDate = soonestOccasion.isJustBecause
            ? 'surprise date'
            : new Date(soonestOccasion.occasionDate).toLocaleDateString();

          await sendUrgentAddressIssueEmail({
            userEmail: user.email,
            userName: user.firstName || user.name || 'there',
            recipientName: `${pendingData.recipient.firstName} ${pendingData.recipient.lastName}`,
            occasionType: soonestOccasion.occasionType,
            occasionDate,
            daysUntil: urgencyCheck.daysUntil!,
            address: {
              street: pendingData.recipient.street,
              apartment: pendingData.recipient.apartment,
              city: pendingData.recipient.city,
              state: pendingData.recipient.state,
              zip: pendingData.recipient.zip,
            },
          }).catch(err => console.error('[PENDING REMINDER EMAIL ERROR]', err));

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
            userEmail: user.email,
            userName: user.firstName || user.name || 'there',
            recipientName: `${pendingData.recipient.firstName} ${pendingData.recipient.lastName}`,
            originalAddress: {
              street: pendingData.recipient.street,
              apartment: pendingData.recipient.apartment,
              city: pendingData.recipient.city,
              state: pendingData.recipient.state,
              zip: pendingData.recipient.zip,
            },
            correctedAddress: verification.suggestedAddress,
          }).catch(err => console.error('[PENDING REMINDER EMAIL ERROR]', err));

        } else if (verification.verdict === 'VALID') {
          // Address is valid
          await db.update(recipients).set({
            addressStatus: 'verified',
            addressVerifiedAt: new Date(),
          }).where(eq(recipients.id, newRecipient.id));
        }
      }
    }

    console.log('[PENDING REMINDER] Successfully created reminder for user:', userId);
    return { success: true, recipientId: newRecipient.id };
  } catch (error) {
    console.error('[PENDING REMINDER] Error creating reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

