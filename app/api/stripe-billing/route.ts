import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get team membership to find team ID
    const membership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, dbUser[0].id))
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json({ billingAddress: null });
    }

    // Get team to find Stripe customer ID
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, membership[0].teamId))
      .limit(1);

    if (team.length === 0 || !team[0].stripeCustomerId) {
      return NextResponse.json({ billingAddress: null });
    }

    // Fetch Stripe customer
    const customer = await stripe.customers.retrieve(team[0].stripeCustomerId);

    if (customer.deleted) {
      return NextResponse.json({ billingAddress: null });
    }

    // Extract billing address
    const address = customer.address;
    if (!address) {
      return NextResponse.json({ billingAddress: null });
    }

    return NextResponse.json({
      billingAddress: {
        street: address.line1 || '',
        apartment: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        zip: address.postal_code || '',
        country: address.country || 'US',
      },
    });
  } catch (error) {
    console.error('Error fetching Stripe billing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

