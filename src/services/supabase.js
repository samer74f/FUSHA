import { createClient } from '@supabase/supabase-js'

const { VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY } = import.meta.env

export const supabase = VITE_SUPABASE_URL && VITE_SUPABASE_PUBLISHABLE_KEY
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
  : null

export async function result(query) {
  const { data, error } = await query
  if (error) throw error
  return data
}
