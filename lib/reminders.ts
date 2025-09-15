import { supabase } from './supabase'

export async function saveReminder(data: any, userId: string) {
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