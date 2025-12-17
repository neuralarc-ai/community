'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import Dashboard from '@/app/components/Dashboard'
import { createClient } from '@/app/lib/supabaseClient'
import { getCurrentUserProfile } from '@/app/lib/getProfile'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)

    const checkUserAndProfile = async () => {
      const { data: { session } } = await client.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // --- MODIFIED CODE START ---
      try {
        const profile = await getCurrentUserProfile()
        if (!profile) {
          router.push('/complete-profile')
          return
        }
        setLoading(false)
      } catch (err: any) {
        // Only redirect to complete-profile if it's specifically a "no profile" error
        // For other errors (like permissions), show the dashboard anyway
        if (err?.code === 'PGRST116') {
          router.push('/complete-profile')
          return
        }
        setLoading(false) // Continue to dashboard even if profile fetch fails
      }
      // --- MODIFIED CODE END ---
    }

    checkUserAndProfile()

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        // --- MODIFIED CODE START ---
        // After sign-in, re-check profile
        checkUserAndProfile()
        // --- MODIFIED CODE END ---
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Dashboard />
    </div>
  )
}
