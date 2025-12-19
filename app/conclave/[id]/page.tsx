'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import ConclaveRoom from '@/components/conclave/ConclaveRoom'

export default function ConclavePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workshop, setWorkshop] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  const handleEndLive = async () => {
    // For now, just return true - this can be enhanced later
    return true
  }

  useEffect(() => {
    const initSession = async () => {
      try {
        // 1. Authentication Check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUserId(user.id)

        // 2. Fetch Workshop Data
        const { data: workshopData, error } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !workshopData) {
          console.error('Workshop not found', error)
          router.push('/workshops')
          return
        }
        setWorkshop(workshopData)

        // 3. Generate LiveKit Token
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workshopId: id,
            roomName: `conclave-${id}`,
            participantName: user.user_metadata?.full_name || user.email
          })
        })

        if (!response.ok) throw new Error('Failed to get token')
        
        const data = await response.json()
        setToken(data.token)
        setServerUrl(data.serverUrl)
      } catch (err) {
        console.error('Conclave init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initSession()
  }, [id, router, supabase])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Entering Conclave</h1>
        <p className="text-zinc-500 mt-2">Connecting to secure session...</p>
      </div>
    )
  }

  if (!workshop || !token || !serverUrl || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <p className="text-zinc-500">Failed to join session. Please try again.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black overflow-hidden flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        {/* Header Area */}
        <div className="mb-6 flex items-center justify-between px-2">
          <div>
            <h1 className="text-2xl font-bold text-white">{workshop.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                Live {workshop.type} Conclave
              </span>
            </div>
          </div>
        </div>

        {/* The LiveKit Room */}
        <ConclaveRoom
          token={token}
          serverUrl={serverUrl}
          workshop={workshop}
          userId={userId}
          onEndLive={handleEndLive}
        />
      </div>
    </main>
  )
}

