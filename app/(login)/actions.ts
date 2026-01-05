'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(1).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const supabase = await createSupabaseServerClient();
  const { email, password } = data;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:57',message:'SignIn attempt',data:{email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  // First, try Supabase authentication
  const supabaseSignInRes = await supabase.auth.signInWithPassword({
    email,
    password
  });

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:62',message:'Supabase signIn response',data:{hasError:!!supabaseSignInRes.error,errorMsg:supabaseSignInRes.error?.message,hasSession:!!supabaseSignInRes.data?.session,emailVerified:supabaseSignInRes.data?.user?.email_confirmed_at},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  if (supabaseSignInRes.error) {
    // Check if it's an email confirmation error
    const errorMsg = supabaseSignInRes.error.message.toLowerCase();
    if (errorMsg.includes('email not confirmed') || errorMsg.includes('email confirmation')) {
      console.log('[SIGN IN] Email not verified for:', email);
      return {
        error: 'Please verify your email address before signing in. Check your inbox for the verification link.',
        emailNotConfirmed: true,
        email,
        password
      };
    }
    
    // Generic error for other cases
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  if (!supabaseSignInRes.data.session) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  // Get user from our database
  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:103',message:'Database user lookup',data:{foundCount:userWithTeam.length,hasTeam:!!userWithTeam[0]?.team,userId:userWithTeam[0]?.user?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4,H5'})}).catch(()=>{});
  // #endregion

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  // Set Supabase session (this handles cookies automatically)
  const { access_token, refresh_token } = supabaseSignInRes.data.session;
  await setSession(access_token, refresh_token);

  // Log activity
  await logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  inviteId: z.string().optional(),
  inviteCode: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const supabase = await createSupabaseServerClient();
  const { email, password, firstName, lastName, inviteId, inviteCode } = data;

  // Validate invite code for new signups (unless they have a team inviteId)
  const VALID_INVITE_CODE = process.env.INVITE_CODE || 'AVOIDPUDDLE#42069!';
  if (!inviteId && inviteCode !== VALID_INVITE_CODE) {
    return {
      error: 'Invalid invite code. Please check and try again.',
      email,
      password
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    // Check if the existing account is unverified in Supabase
    // This allows users to "reclaim" their email if they mistyped it or someone else used it
    const { data: supabaseUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && supabaseUsers) {
      const supabaseUser = supabaseUsers.users.find(u => u.email === email);
      
      if (supabaseUser && !supabaseUser.email_confirmed_at) {
        // Account exists but is unverified - allow reclaim
        console.log(`[SIGN UP] Reclaiming unverified account: ${email}`);
        
        try {
          // First, delete database records in proper order to respect foreign keys
          const userId = existingUser[0].id;
          
          // Delete team members first (references users)
          await db.delete(teamMembers).where(eq(teamMembers.userId, userId));
          
          // Get user's teams to check if they're the only member
          const userTeams = await db
            .select({ teamId: teamMembers.teamId })
            .from(teamMembers)
            .where(eq(teamMembers.teamId, userId));
          
          // Delete the user (this will cascade to activity logs via DB constraints)
          await db.delete(users).where(eq(users.id, userId));
          
          // Delete orphaned teams if this was the only member
          for (const { teamId } of userTeams) {
            const remainingMembers = await db
              .select()
              .from(teamMembers)
              .where(eq(teamMembers.teamId, teamId))
              .limit(1);
            
            if (remainingMembers.length === 0) {
              await db.delete(teams).where(eq(teams.id, teamId));
            }
          }
          
          // Finally, delete Supabase auth account
          const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(supabaseUser.id);
          if (deleteAuthError) {
            console.error('[SIGN UP] Error deleting old Supabase account:', deleteAuthError);
          }
          
          console.log(`[SIGN UP] ✅ Deleted unverified account, allowing new sign-up for: ${email}`);
        } catch (deleteError) {
          console.error('[SIGN UP] Error cleaning up unverified account:', deleteError);
          return {
            error: 'Failed to clean up previous account. Please contact support.',
            email,
            password
          };
        }
        // Continue with new sign-up below
      } else {
        // Account is verified or error occurred - don't allow sign-up
        return {
          error: 'An account with this email already exists. Please sign in instead.',
          email,
          password
        };
      }
    } else {
      // Couldn't check Supabase status - err on side of caution
      return {
        error: 'Failed to create user. Please try again.',
        email,
        password
      };
    }
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    firstName: firstName || null,
    lastName: lastName || null,
    role: 'owner' // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  const supabaseSignUpRes = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:347',message:'Supabase signUp response',data:{hasError:!!supabaseSignUpRes.error,hasSession:!!supabaseSignUpRes.data?.session,hasUser:!!supabaseSignUpRes.data?.user,emailConfirmed:supabaseSignUpRes.data?.user?.email_confirmed_at,createdUserId:createdUser.id,createdTeamId:teamId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2,H3,H4'})}).catch(()=>{});
  // #endregion

  if (supabaseSignUpRes.error) {
    console.error('Supabase Auth error:', supabaseSignUpRes.error?.message);
    return {
      error: 'Failed to sign up with Supabase Auth.',
      email,
      password
    };
  }

  // Check if email confirmation is required
  const { session, user: supabaseUser } = supabaseSignUpRes.data;

  if (supabaseUser && !session) {
    // Email confirmation is enabled and user needs to verify
    // Don't create the session yet, show them a "check your email" message
    console.log('[SIGN UP] Email confirmation required for:', email);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f35922fa-18f6-4b9a-9ca1-2201e36a1ceb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:365',message:'Email confirmation required - returning success',data:{email,dbUserId:createdUser.id,dbTeamId:teamId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2,H3'})}).catch(()=>{});
    // #endregion

    return {
      success: true,
      message: 'Please check your email to confirm your account.',
      email,
      requiresEmailConfirmation: true
    };
  }

  if (!session) {
    console.error('No session created after sign up');
    return {
      error: 'Failed to create session.',
      email,
      password
    };
  }

  const { access_token, refresh_token } = session;

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(access_token, refresh_token)
  ]);

  // Send welcome email (don't await to avoid blocking the user)
  const { sendWelcomeEmail } = await import('@/lib/email');
  sendWelcomeEmail({ user: createdUser }).catch((error) => {
    console.error('Failed to send welcome email:', error);
  });

  const redirectTo = formData.get('redirect') as string | null;
  
  // Check if user came from create-reminder flow (has pending reminder data)
  // This is indicated by the 'from=create-reminder' query param
  // Redirect them to the attach-reminder page to process their saved data
  if (redirectTo && redirectTo.includes('create-reminder')) {
    redirect('/onboarding/attach-reminder');
  }
  
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

const resendVerificationSchema = z.object({
  email: z.string().email()
});

export const resendVerificationEmail = validatedAction(
  resendVerificationSchema,
  async (data) => {
    const supabase = await createSupabaseServerClient();
    const { email } = data;

    console.log('[RESEND] Attempting to resend verification email to:', email);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error) {
      console.error('[RESEND] Error:', error.message);
      return {
        error: 'Failed to resend verification email. Please try again later.',
        email
      };
    }

    console.log('[RESEND] ✅ Verification email resent to:', email);
    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.',
      email
    };
  }
);

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db.update(users).set({ name, email }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email if needed in the future
    // For now, invitation system exists but email is not configured

    return { success: 'Invitation sent successfully' };
  }
);
