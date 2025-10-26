import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userAddresses } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
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

    // Get all addresses for user
    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, dbUser[0].id))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // If this is set as default, unset other defaults
    if (body.isDefault === 1) {
      await db
        .update(userAddresses)
        .set({ isDefault: 0 })
        .where(eq(userAddresses.userId, dbUser[0].id));
    }

    // Create address
    const [newAddress] = await db
      .insert(userAddresses)
      .values({
        ...body,
        userId: dbUser[0].id,
      })
      .returning();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

