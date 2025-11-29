import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { occasions, recipients, users, teamMembers, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calculateCardAllocation } from '@/lib/card-allocation';

export async function GET(request: NextRequest) {
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

    // Get user's team
    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, dbUser[0].id))
      .limit(1);

    if (userTeam.length === 0) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const teamData = await db
      .select()
      .from(teams)
      .where(eq(teams.id, userTeam[0].teamId))
      .limit(1);

    const team = teamData[0] || null;

    // Get all recipients for this user
    const userRecipients = await db
      .select()
      .from(recipients)
      .where(eq(recipients.userId, dbUser[0].id));

    const recipientIds = userRecipients.map(r => r.id);

    // Count total occasions
    let totalOccasions = 0;
    if (recipientIds.length > 0) {
      const allOccasions = await db
        .select()
        .from(occasions)
        .where(eq(occasions.recipientId, recipientIds[0]));
      
      // Get occasions for all recipients
      for (const recipientId of recipientIds) {
        const recipientOccasions = await db
          .select()
          .from(occasions)
          .where(eq(occasions.recipientId, recipientId));
        totalOccasions += recipientOccasions.length;
      }
    }

    // Calculate allocation
    const allocation = calculateCardAllocation(totalOccasions, team);

    return NextResponse.json(allocation);
  } catch (error) {
    console.error('Error fetching card allocation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

