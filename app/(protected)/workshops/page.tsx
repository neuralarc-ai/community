'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import CreateWorkshopModal from '@/app/components/CreateWorkshopModal'
import WorkshopCard from '@/app/components/WorkshopCard'
import { createClient } from '@/app/lib/supabaseClient'

interface Workshop {
  id: string
  title: string
  description: string
  start_time: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'
  recording_url?: string
  host_id: string
  ended_at?: string
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getSession()
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) throw error
      setWorkshops(data || [])
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27584F] mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-[1400px] py-8 mx-auto px-6 space-y-12">
      <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Community Conclave</h1>
            <p className="text-lg text-muted-foreground">Twitter Spaces meets YouTube Live. Learn together.</p>
          </div>
          <CreateWorkshopModal onWorkshopCreated={fetchWorkshops} />
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop) => (
            <WorkshopCard 
              key={workshop.id} 
              workshop={workshop as any} 
              isHost={workshop.host_id === userId}
            />
          ))}
        </div>
        
        {workshops.length === 0 && !loading && (
             <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-[#27584F]/30">
               <p className="text-muted-foreground text-lg mb-4">No conclaves scheduled yet.</p>
               <p className="text-muted-foreground text-sm">Be the first to host a conclave and share your knowledge!</p>
             </div>
        )}
    </div>
  )
}
