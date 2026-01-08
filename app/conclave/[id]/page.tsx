'use client'

import { createClient } from '@/app/lib/supabaseClient'
import ConclaveRoom from '@/components/conclave/ConclaveRoom'
import { Toaster } from '@/components/ui/sonner'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

export default function ConclavePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workshop, setWorkshop] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const supabase = createClient()
  const isHost = workshop?.host_id === userId // Determine if the current user is the host

  const handleEndLive = async () => {
    // For now, just return true - this can be enhanced later
    router.push(`/workshops`); // Redirect to the workshops page
    return true
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
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

        // Fetch user profile to get username and role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('User profile not found:', profileError)
          router.push('/login') // Or handle this error appropriately
          return
        }

        const participantUsername = profile.username;
        setUserRole(profile.role);

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
            participantName: participantUsername
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
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-foreground">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-foreground/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Entering Conclave</h1>
        <p className="text-zinc-500 mt-2">Connecting to secure session...</p>
      </div>
    )
  }

  if (!workshop || !token || !serverUrl || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-foreground">
        <p className="text-zinc-500">Failed to join session. Please try again.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen  overflow-hidden flex flex-col">
      <div className="p-4 flex-1">
        {/* Header Area */}
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-foreground hover:text-muted-foreground transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{workshop.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                  Live {workshop.type} Conclave
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* The LiveKit Room */}
        <ConclaveRoom
          token={token}
          serverUrl={serverUrl}
          workshop={workshop}
          userId={userId}
          userRole={userRole}
          onEndLive={handleEndLive}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          roomName={`conclave-${id}`}
        />
      </div>
      <Toaster position='top-center'/>
    </main>
  )
}
