'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import { createProfile, getCurrentUserProfile } from '@/app/lib/getProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
  const [maxDobDate, setMaxDobDate] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setJoinDate(new Date(user.created_at).toLocaleDateString())

      const twelveYearsAgo = new Date()
      twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12)
      const formattedMaxDate = twelveYearsAgo.toISOString().split('T')[0]
      setMaxDobDate(formattedMaxDate)

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 animated-background">
      <img src="/images/default-avatar.jpg" alt="Profile Completion Illustration" className="mx-auto h-48 w-48 rounded-full mb-8 object-cover" />
      <Card className="max-w-2xl w-full space-y-8 bg-card border-border text-foreground shadow-lg p-8">
        <CardHeader>
          <CardTitle className="mt-6 text-center text-3xl font-bold text-foreground tracking-tight">
            Complete Your Profile
          </CardTitle>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please fill out your profile information to continue
          </p>
        </CardHeader>

        <CardContent>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <Label htmlFor="full_name" className="block text-sm font-medium text-foreground">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="mt-2 block w-full bg-input border-border text-foreground rounded-md shadow-sm focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-red-accent transition-all duration-200 sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-foreground">
                  Username *
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-2 block w-full bg-input border-border text-foreground rounded-md shadow-sm focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-red-accent transition-all duration-200 sm:text-sm"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                />
                {usernameChecking && (
                  <p className="mt-1 text-sm text-muted-foreground">Checking username...</p>
                )}
              </div>

              <div>
                <Label htmlFor="dob" className="block text-sm font-medium text-foreground">
                  Date of Birth *
                </Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  max={maxDobDate}
                  className="mt-2 block w-full bg-input border-border text-foreground rounded-md shadow-sm focus:border-transparent focus:ring-2 focus:ring-offset-2 focus:ring-red-accent transition-all duration-200 sm:text-sm"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="join_date" className="block text-sm font-medium text-foreground">
                  Date of Joining
                </Label>
                <Input
                  id="join_date"
                  name="join_date"
                  type="text"
                  readOnly
                  className="mt-2 block w-full bg-input border-border text-foreground rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                  value={joinDate}
                />
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading || usernameChecking || !formData.full_name || !formData.username || !formData.dob || !!error}
                className="w-full bg-red-accent text-primary-foreground hover:bg-red-accent-hover focus:ring-background disabled:opacity-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
