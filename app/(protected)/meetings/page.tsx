'use client'

import { useState, useEffect, Suspense } from 'react'
import Header from '@/app/components/Header'
import { Meeting } from '@/app/types'
import { Calendar, Clock, Video, Edit } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function MeetingsContent() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchMeetings()
  }, [searchParams])

  const fetchMeetings = async () => {
    try {
      const searchQuery = searchParams.get('search')
      const url = searchQuery ? `/api/events?search=${encodeURIComponent(searchQuery)}` : '/api/events'
      const response = await fetch(url)
      const data = await response.json()
      setMeetings(data.meetings)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading meetings...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-12 pl-24 pr-6 mx-auto">
      <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Online Meetings</h1>
            <p className="text-lg text-muted-foreground">Schedule and manage community meetings</p>
          </div>
          <button className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#EFB3AF]/80 hover:bg-[#EFB3AF] text-white shadow-sm hover:shadow-[0_0_20px_rgba(239,179,175,0.2)]">
            Schedule Meeting
          </button>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-card/40 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-[#EFB3AF]/20 hover:border-[#EFB3AF]/40 hover:shadow-[0_0_20px_rgba(239,179,175,0.1)] hover:bg-[#EFB3AF]/5 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-[#EFB3AF]/10 text-[#EFB3AF] rounded-full text-xs font-medium border border-[#EFB3AF]/20">
                  {meeting.type}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-[#EFB3AF] transition-colors">{meeting.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{meeting.agenda}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm group-hover:text-[#EFB3AF]/70 transition-colors">
                  <Calendar size={16} />
                  <span>{formatDate(meeting.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm group-hover:text-[#EFB3AF]/70 transition-colors">
                  <Clock size={16} />
                  <span>{meeting.time} ({meeting.duration} min)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#EFB3AF]/20 hover:bg-[#EFB3AF]/30 text-[#EFB3AF] px-4 py-2 rounded-lg font-medium transition-colors border border-[#EFB3AF]/20 hover:border-[#EFB3AF]/30">
                  <Video size={16} />
                  Join Meeting
                </button>
                <button className="flex items-center gap-2 bg-transparent hover:bg-[#EFB3AF]/10 text-[#EFB3AF]/80 hover:text-[#EFB3AF] px-4 py-2 rounded-lg font-medium transition-colors border border-[#EFB3AF]/20 hover:border-[#EFB3AF]/30">
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingsContent />
    </Suspense>
  )
}
