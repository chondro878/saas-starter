import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { userAddresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET single address
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
    const addressId = parseInt(id);

    const address = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.id, addressId))
      .limit(1);

    if (address.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(address[0]);
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// UPDATE address
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
    const addressId = parseInt(id);
    const body = await request.json();

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

    // Verify address belongs to user
    const existingAddress = await db
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.id, addressId),
          eq(userAddresses.userId, dbUser[0].id)
        )
      )
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    // Update address
    const [updatedAddress] = await db
      .update(userAddresses)
      .set({
        street: body.street,
        apartment: body.apartment,
        city: body.city,
        state: body.state,
        zip: body.zip,
        country: body.country || 'United States',
        updatedAt: new Date(),
      })
      .where(eq(userAddresses.id, addressId))
      .returning();

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE address
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
    const addressId = parseInt(id);

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

    // Verify address belongs to user
    const existingAddress = await db
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.id, addressId),
          eq(userAddresses.userId, dbUser[0].id)
        )
      )
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    // Delete address
    await db.delete(userAddresses).where(eq(userAddresses.id, addressId));

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

