'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import { createProfile, getCurrentUserProfile } from '@/app/lib/getProfile'

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    dob: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profile = await getCurrentUserProfile()
      if (profile) {
        // If profile exists, redirect away from complete profile page
        router.push('/dashboard') // Or wherever you want to send them
      }
    }
    checkAuthAndProfile()
  }, [supabase, router])

  const validateUsername = async (username: string) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores'
    }

    try {
      setUsernameChecking(true)
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`)
      const data = await response.json()

      if (!response.ok) {
        return data.error || 'Error checking username availability'
      }

      if (data.exists) {
        return 'Username is already taken'
      }
    } catch (err) {
      console.error("Error checking username:", err)
      return 'Error checking username availability'
    } finally {
      setUsernameChecking(false)
    }

    return null
  }

  const handleUsernameChange = async (username: string) => {
    setFormData(prev => ({ ...prev, username }))

    if (username.length >= 3) {
      const validationError = await validateUsername(username)
      if (validationError) {
        setError(validationError)
      } else {
        setError('')
      }
    } else {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Final username validation
      const usernameError = await validateUsername(formData.username)
      if (usernameError) {
        setError(usernameError)
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      await createProfile({
        id: user.id,
        full_name: formData.full_name,
        username: formData.username,
        dob: formData.dob
      })

      // Redirect to dashboard after completing profile
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Failed to create profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill out your profile information to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
              />
              {usernameChecking && (
                <p className="mt-1 text-sm text-gray-500">Checking username...</p>
              )}
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || usernameChecking || !formData.full_name || !formData.username || !formData.dob || !!error}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
