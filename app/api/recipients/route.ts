import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { recipients, occasions } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

    // Get occasions for each recipient
    const recipientsWithOccasions = await Promise.all(
      userRecipients.map(async (recipient) => {
        const recipientOccasions = await db
          .select()
          .from(occasions)
          .where(eq(occasions.recipientId, recipient.id))
          .orderBy(asc(occasions.occasionDate));
        
        return {
          ...recipient,
          occasions: recipientOccasions,
        };
      })
    );

    return NextResponse.json(recipientsWithOccasions);
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
          recipientId: newRecipient.id,
        };
      });
      
      await db.insert(occasions).values(formattedOccasions);
    }

    return NextResponse.json(newRecipient, { status: 201 });
  } catch (error) {
    console.error('Error creating recipient:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

