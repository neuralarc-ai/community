import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/posts')
  } else {
    redirect('/login')
  }
}
