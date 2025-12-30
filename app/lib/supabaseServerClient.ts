import { createServerClient as createServerClientOriginal } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient(useServiceRole = false) {
  const cookieStore = await cookies()

  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key if requested
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClientOriginal(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookies can only be modified in Server Actions or Route Handlers
            // Silently fail in server components - the cookie will be handled by middleware
            // This prevents the error from crashing the app
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Cookies can only be modified in Server Actions or Route Handlers
            // Silently fail in server components - the cookie will be handled by middleware
            // This prevents the error from crashing the app
          }
        },
      },
    }
  )
}
