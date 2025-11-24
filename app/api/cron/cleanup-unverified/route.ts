import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Cron job to cleanup unverified accounts older than 72 hours
 * This prevents email squatting and frees up email addresses
 * 
 * Should be called daily via a cron service (Vercel Cron, etc.)
 */
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();
    
    // Calculate cutoff date (72 hours ago)
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    
    console.log('[CLEANUP] Starting cleanup of unverified accounts older than:', cutoffDate.toISOString());

    // Get all users from our database
    const allUsers = await db.select().from(users);
    
    let deletedCount = 0;
    let errorCount = 0;

    for (const user of allUsers) {
      try {
        // Check Supabase auth status
        const { data: authUsers, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
          console.error('[CLEANUP] Error listing Supabase users:', error);
          continue;
        }

        const supabaseUser = authUsers.users.find(u => u.email === user.email);
        
        if (supabaseUser) {
          const createdAt = new Date(supabaseUser.created_at);
          
          // Check if user is unverified and older than cutoff
          if (!supabaseUser.email_confirmed_at && createdAt < cutoffDate) {
            console.log(`[CLEANUP] Deleting unverified account: ${user.email} (created: ${createdAt.toISOString()})`);
            
            // Delete from Supabase Auth
            const { error: deleteError } = await supabase.auth.admin.deleteUser(supabaseUser.id);
            
            if (deleteError) {
              console.error(`[CLEANUP] Error deleting Supabase user ${user.email}:`, deleteError);
              errorCount++;
              continue;
            }
            
            // Delete from our database (cascade will handle related records)
            await db.delete(users).where(eq(users.email, user.email));
            
            deletedCount++;
            console.log(`[CLEANUP] ✅ Deleted: ${user.email}`);
          }
        }
      } catch (error) {
        console.error(`[CLEANUP] Error processing user ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log(`[CLEANUP] Completed. Deleted: ${deletedCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CLEANUP] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

