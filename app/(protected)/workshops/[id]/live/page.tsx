'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/lib/supabaseClient'
import LiveRoom from '@/app/components/LiveRoom'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function WorkshopLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [workshop, setWorkshop] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const handleEndWorkshop = async () => {
    try {
      // Update workshop status to ENDED
      const response = await fetch(`/api/workshops/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENDED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to end workshop')
      }
      
      return true
    } catch (error) {
      console.error('Error ending workshop:', error)
      alert('Failed to end workshop. Please try again.')
      return false
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: workshop } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', id)
        .single()

      setWorkshop(workshop)
      setLoading(false)
    }

    fetchData()
  }, [id])

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (!workshop) return <div className="flex justify-center items-center h-screen">Conclave not found</div>

  const isHost = user?.id === workshop.host_id

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/workshops">
            <ChevronLeft size={16} />
            Back to Conclave
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className={`text-sm font-bold uppercase ${workshop.status === 'LIVE' ? 'text-red-500' : 'text-blue-500'}`}>
            {workshop.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">{workshop.title}</h1>
          
          <LiveRoom
            workshopId={id}
            roomName={`workshop-${id}`}
            participantName={user?.user_metadata?.full_name || user?.email || 'Anonymous'}
            isHost={isHost}
            mode="video" // Can be switched to "audio" for Twitter Spaces style
            onEndLive={handleEndWorkshop}
          />

          <div className="bg-card/50 border border-border p-6 rounded-xl space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <Info size={18} className="text-[#27584F]" />
              About this Conclave
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">{workshop.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card/50 border border-border p-6 rounded-xl">
            <h3 className="font-bold mb-4">Conclave Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Host</span>
                <span className="font-medium">You (Host)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started</span>
                <span className="font-medium">{new Date(workshop.start_time).toLocaleTimeString()}</span>
              </div>
              {isHost && (
                <div className="pt-4 border-t border-border mt-4">
                   <p className="text-[11px] text-muted-foreground mb-2 italic">You are the host. You can manage recording and notifications from the player controls.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-xl">
             <h3 className="font-bold text-blue-500 mb-2">Live Chat</h3>
             <p className="text-xs text-muted-foreground">Chat feature coming soon. Use the live audio/video to interact!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

