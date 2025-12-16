'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabaseClient'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)

    const checkUser = async () => {
      try {
        const { data: { user } } = await client.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="mb-8">
              <h1 className="page-title mb-3">
                Welcome back, {user.email}!
              </h1>
              <p className="page-subtitle">
                You're successfully logged in to the Community Portal.
              </p>
            </div>
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="btn-primary w-full flex justify-center py-3 px-4 text-center"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => supabase?.auth.signOut()}
                className="btn-secondary w-full flex justify-center py-3 px-4"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
              Community Portal
            </h1>
            <p className="text-[var(--text-secondary)]">
              Manage your community with posts, workshops, and meetings.
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/login"
              className="btn-primary w-full flex justify-center py-3 px-4 text-center"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-secondary w-full flex justify-center py-3 px-4 text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
