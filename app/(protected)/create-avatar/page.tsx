'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import AvatarEditor from '@/app/components/AvatarEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUserProfile } from '@/app/lib/getProfile'

export default function CreateAvatarPage() {
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profile = await getCurrentUserProfile()
      if (profile && profile.avatar_url) {
        // If avatar already exists, redirect to dashboard
        router.push('/dashboard')
        return
      }
      
      setCurrentAvatarUrl(profile?.avatar_url || undefined)
      setLoading(false)
    }
    fetchProfile()
  }, [router, supabase])

  const handleAvatarSave = async (newUrl: string) => {
    // Update the avatar_url in the user's profile
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: newUrl })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      router.push('/dashboard') // Redirect to dashboard after saving avatar
      router.refresh()
    } catch (error: any) {
      console.error('Error saving avatar:', error.message)
      alert('Failed to save avatar. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-bg py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 bg-cyber-component border-cyber-border text-cyber-text shadow-lg">
        <CardHeader>
          <CardTitle className="mt-6 text-center text-3xl font-bold text-cyber-text tracking-tight">
            Create Your Avatar
          </CardTitle>
          <p className="mt-2 text-center text-sm text-cyber-secondary">
            Personalize your profile with a unique avatar.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-6">
          <AvatarEditor 
            currentAvatarUrl={currentAvatarUrl}
            onClose={() => { /* No-op or custom logic if needed */ }}
            onSave={handleAvatarSave}
          />
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full bg-transparent border-cyber-border text-cyber-text hover:bg-cyber-input"
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
