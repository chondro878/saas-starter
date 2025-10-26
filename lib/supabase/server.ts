import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookies can only be set in Server Actions/Route Handlers
            // Silently fail during page rendering
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Cookies can only be removed in Server Actions/Route Handlers
            // Silently fail during page rendering
          }
        },
      },
    }
  )
}
