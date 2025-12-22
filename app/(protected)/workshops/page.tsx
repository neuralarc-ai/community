'use client'

import { useState, useEffect, Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CreateWorkshopModal from '@/app/components/CreateWorkshopModal'
import WorkshopCard from '@/app/components/WorkshopCard'
import { createClient } from '@/app/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'
import { getCurrentUserProfile } from '@/app/lib/getProfile'
import { Profile } from '@/app/types'

interface Workshop {
  id: string
  title: string
  description: string
  start_time: string
  status: 'SCHEDULED' | 'LIVE' | 'ENDED'
  recording_url?: string
  host_id: string
  ended_at?: string
  is_archived?: boolean
}

function WorkshopsContent() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<Profile['role'] | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      if (user) {
        const profile = await getCurrentUserProfile()
        setUserRole(profile?.role || null)
      }
    }
    getSessionAndProfile()
    fetchWorkshops()
  }, [searchParams, showArchived])

  const fetchWorkshops = async () => {
    try {
      const searchQuery = searchParams.get('search')
      let url = '/api/workshops'
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (showArchived) {
        params.append('showArchived', 'true')
      }
      if (params.toString()) {
        url = `${url}?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      // Sort workshops by start_time in descending order (newest first)
      const sortedWorkshops = (data.workshops ?? []).sort((a: Workshop, b: Workshop) => {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      });
      setWorkshops(sortedWorkshops || [])
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleShowArchived = () => {
    setShowArchived(prev => !prev)
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
            <h1 className="text-4xl font-bold text-white tracking-tight">Conclave</h1>
            <p className="text-lg text-muted-foreground">Schedule and manage online conclaves</p>
          </div>
          <div className="flex gap-4">
            {userRole === 'admin' && (
              <Button
                variant="outline"
                onClick={handleToggleShowArchived}
                className="bg-[#18181b]/50 border-[#27584F]/30 text-[#27584F] hover:bg-[#27584F]/10"
              >
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>
            )}
            {userRole === 'admin' && (
              <CreateWorkshopModal onWorkshopCreated={fetchWorkshops} />
            )}
          </div>
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
             <div className="text-center py-12">
               <p className="text-muted-foreground text-lg">No conclaves scheduled yet.</p>
             </div>
        )}
    </div>
  )
}

export default function WorkshopsPage() {
  return (
    <Suspense fallback={<div>Loading workshops...</div>}>
      <WorkshopsContent />
    </Suspense>
  )
}
