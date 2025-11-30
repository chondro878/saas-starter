import { getUser } from '@/lib/db/queries';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const user = await getUser();
  
  // Check if user is an admin based on ADMIN_EMAILS environment variable
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;
  
  // Return user with isAdmin flag
  return Response.json({
    ...user,
    isAdmin
  });
}

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, phone } = await request.json();

    // Find the user in the database
    const dbUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, supabaseUser.email!))
      .limit(1);

    if (dbUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user
    await db
      .update(users)
      .set({
        firstName,
        lastName,
        phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUsers[0].id));

    // Return updated user
    const updatedUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, dbUsers[0].id))
      .limit(1);

    return Response.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
