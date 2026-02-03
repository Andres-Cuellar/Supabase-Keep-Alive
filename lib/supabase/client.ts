import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Soportar tanto la nueva PUBLISHABLE_KEY como la legacy ANON_KEY
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey!
  )
}
