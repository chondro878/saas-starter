import { createSupabaseServerClient } from './supabase/server'

export async function saveReminder(data: any, userId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('reminders').insert([
    {
      user_id: userId,
      ...data,
    },
  ])

  if (error) {
    console.error('Failed to save reminder:', error)
    throw error
  }
}