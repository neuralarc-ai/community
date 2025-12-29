'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import { createProfile, getCurrentUserProfile } from '@/app/lib/getProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, AtSign, CalendarDays, ArrowRight } from 'lucide-react' // Added icons

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    dob: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [joinDate, setJoinDate] = useState('')
  const router = useRouter()
    const supabase = createClient()

  const twelveYearsAgo = new Date()
  twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12)
  const maxDate = twelveYearsAgo.toISOString().split('T')[0]

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setJoinDate(new Date(user.created_at).toLocaleDateString())

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

      // Redirect to avatar creation after completing profile
      router.push('/create-avatar')
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Failed to create profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-10 bg-[#1A1A1A]">
      <div className="flex flex-col md:flex-row rounded-lg overflow-hidden max-w-4xl w-full shadow-2xl">
        {/* Left Column: Image and Identity */}
        <div className="flex-1 bg-[#222222] p-8 flex flex-col items-center justify-center text-white space-y-4">
          <div className="relative w-48 h-48 mb-4">
            <img
              src="/sphere logo.png" // Using public/sphere logo.png as placeholder
              alt="Abstract geometric design"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-wider">JOIN OUR COMMUNITY</h2>
          <h1 className="text-4xl font-bold text-white text-center">Create Your Identity</h1>
        </div>

        {/* Right Column: Profile Form */}
        <div className="flex-1 bg-[#282828] p-8 space-y-6 text-white">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold">Complete Your Profile</h2>
            <p className="text-gray-400 mt-1">Tell us a bit about yourself?</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline-block mr-2 h-4 w-4" /> Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="block w-full px-4 py-2 rounded-md bg-[#333333] border border-[#444444] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors duration-200"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                <AtSign className="inline-block mr-2 h-4 w-4" /> Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full px-4 py-2 rounded-md bg-[#333333] border border-[#444444] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors duration-200"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
              />
              {usernameChecking && (
                <p className="mt-1 text-sm text-gray-500">Checking username...</p>
              )}
            </div>

            {/* Birthdate */}
            <div>
              <Label htmlFor="dob" className="block text-sm font-medium text-gray-300 mb-2">
                <CalendarDays className="inline-block mr-2 h-4 w-4" /> Birthdate
              </Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                required
                max={maxDate}
                className="block w-full px-4 py-2 rounded-md bg-[#333333] border border-[#444444] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors duration-200"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
              />
              <p className="mt-1 text-xs text-gray-500">(Must be 12+)</p>
            </div>

            {/* Joining Date */}
            <div>
              <Label htmlFor="join_date" className="block text-sm font-medium text-gray-300 mb-2">
                <CalendarDays className="inline-block mr-2 h-4 w-4" /> Joining Date
              </Label>
              <Input
                id="join_date"
                name="join_date"
                type="text"
                readOnly
                className="block w-full px-4 py-2 rounded-md bg-[#333333] border border-[#444444] text-gray-400 cursor-not-allowed"
                value={joinDate}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={loading || usernameChecking || !formData.full_name || !formData.username || !formData.dob || !!error}
                className="w-full flex items-center justify-center px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-gray-500">
              By completing your profile, you agree to our <a href="/terms-of-use" className="text-red-500 hover:underline">Terms of Service</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
