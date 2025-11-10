import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { recipients, occasions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET single recipient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const recipientId = parseInt(id);

    // Get recipient with occasions
    const recipient = await db
      .select()
      .from(recipients)
      .where(eq(recipients.id, recipientId))
      .limit(1);

    if (recipient.length === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Get occasions
    const recipientOccasions = await db
      .select()
      .from(occasions)
      .where(eq(occasions.recipientId, recipientId));

    return NextResponse.json({
      ...recipient[0],
      occasions: recipientOccasions,
    });
  } catch (error) {
    console.error('Error fetching recipient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE recipient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const recipientId = parseInt(id);
    const body = await request.json();
    const { recipientData, occasionsData } = body;

    // Verify recipient belongs to user
    const { users } = await import('@/lib/db/schema');
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email!))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingRecipient = await db
      .select()
      .from(recipients)
      .where(
        and(
          eq(recipients.id, recipientId),
          eq(recipients.userId, dbUser[0].id)
        )
      )
      .limit(1);

    if (existingRecipient.length === 0) {
      return NextResponse.json({ error: 'Recipient not found or unauthorized' }, { status: 404 });
    }

    // Update recipient
    const [updatedRecipient] = await db
      .update(recipients)
      .set({
        ...recipientData,
        updatedAt: new Date(),
      })
      .where(eq(recipients.id, recipientId))
      .returning();

    // Delete existing occasions and recreate them
    if (occasionsData) {
      await db.delete(occasions).where(eq(occasions.recipientId, recipientId));

      if (occasionsData.length > 0) {
        const formattedOccasions = occasionsData.map((occasion: any) => {
          const dateValue = occasion.occasionDate;
          const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);

          if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid date for occasion: ${occasion.occasionType}`);
          }

          return {
            occasionType: occasion.occasionType,
            occasionDate: dateObj,
            notes: occasion.notes || '',
            recipientId: recipientId,
          };
        });

        await db.insert(occasions).values(formattedOccasions);
      }
    }

    return NextResponse.json(updatedRecipient);
  } catch (error) {
    console.error('Error updating recipient:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE recipient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const recipientId = parseInt(id);

    // Verify recipient belongs to user
    const { users } = await import('@/lib/db/schema');
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email!))
      .limit(1);

    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingRecipient = await db
      .select()
      .from(recipients)
      .where(
        and(
          eq(recipients.id, recipientId),
          eq(recipients.userId, dbUser[0].id)
        )
      )
      .limit(1);

    if (existingRecipient.length === 0) {
      return NextResponse.json({ error: 'Recipient not found or unauthorized' }, { status: 404 });
    }

    // Delete occasions first (foreign key constraint)
    await db.delete(occasions).where(eq(occasions.recipientId, recipientId));

    // Delete recipient
    await db.delete(recipients).where(eq(recipients.id, recipientId));

    return NextResponse.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

