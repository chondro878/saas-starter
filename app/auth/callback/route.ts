import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect');

  if (code) {
    const supabase = await createSupabaseServerClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(new URL('/sign-in?error=oauth_failed', requestUrl.origin));
    }

    if (data.user) {
      // Check if user exists in our database
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.user.email!))
        .limit(1);

      if (existingUser.length === 0) {
        // Create new user from OAuth data
        const [createdUser] = await db.insert(users).values({
          email: data.user.email!,
          passwordHash: '', // OAuth users don't have passwords
          firstName: data.user.user_metadata?.given_name || data.user.user_metadata?.name?.split(' ')[0] || null,
          lastName: data.user.user_metadata?.family_name || data.user.user_metadata?.name?.split(' ').slice(1).join(' ') || null,
          role: 'owner'
        }).returning();

        // Create team for new user
        const [createdTeam] = await db.insert(teams).values({
          name: `${data.user.email}'s Team`
        }).returning();

        // Add user to team
        await db.insert(teamMembers).values({
          userId: createdUser.id,
          teamId: createdTeam.id,
          role: 'owner'
        });
      }
    }
  }

  // Redirect to dashboard or specified redirect URL
  const redirectUrl = redirect || '/dashboard';
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
}

