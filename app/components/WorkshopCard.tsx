'use client'

import { useState } from 'react'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = diffInMs / (1000 * 60)
    return `${Math.floor(diffInMinutes)}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    const diffInDays = diffInHours / 24
    return `${Math.floor(diffInDays)}d ago`
  }
}
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, Video, Bell, CalendarPlus, Square, PlayCircle, Archive } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/components/ui/button'
import { google, outlook, office365, yahoo, ics, CalendarEvent } from 'calendar-link'
import { createClient } from '@/app/lib/supabaseClient'
import VodPlayer from '@/app/components/VodPlayer'

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

interface WorkshopCardProps {
  workshop: Workshop
  isHost: boolean
}

export default function WorkshopCard({ workshop, isHost }: WorkshopCardProps) {
  const [email, setEmail] = useState('')
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false)
  const [joinedWaitlist, setJoinedWaitlist] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const event: CalendarEvent = {
    title: workshop.title,
    description: workshop.description,
    start: workshop.start_time,
    duration: [1, 'hour'], // Default 1 hour
  }

  const handleEndWorkshop = async () => {
    if (!confirm('Are you sure you want to end this conclave? This will stop the live session for everyone.')) {
      return
    }

    setIsEnding(true)
    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENDED' }),
      })

      if (!response.ok) {
        throw new Error('Failed to end workshop')
      }

      router.refresh()
    } catch (error) {
      console.error('Error ending workshop:', error)
      alert('Failed to end workshop. Please try again.')
    } finally {
      setIsEnding(false)
    }
  }

  const handleArchiveToggle = async () => {
    if (!confirm(`Are you sure you want to ${workshop.is_archived ? 'unarchive' : 'archive'} this conclave?`)) {
      return
    }

    setIsArchiving(true)
    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: !workshop.is_archived }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${workshop.is_archived ? 'unarchive' : 'archive'} workshop`)
      }

      router.refresh()
    } catch (error) {
      console.error('Error archiving/unarchiving workshop:', error)
      alert(`Failed to ${workshop.is_archived ? 'unarchive' : 'archive'} workshop. Please try again.`)
    } finally {
      setIsArchiving(false)
    }
  }

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsJoiningWaitlist(true)
    try {
      const { error } = await supabase
        .from('workshop_waitlist')
        .insert({
          workshop_id: workshop.id,
          user_email: email.trim()
        })

      if (error) {
        console.error('Error joining waitlist:', error)
        alert('Failed to join waitlist. Please try again.')
        return
      }

      setJoinedWaitlist(true)
      setEmail('')
    } catch (error) {
      console.error('Error joining waitlist:', error)
      alert('Failed to join waitlist. Please try again.')
    } finally {
      setIsJoiningWaitlist(false)
    }
  }

  return (
    <Card className={`overflow-hidden border-[#27584F]/50 shadow-sm transition-all duration-300 bg-card/40 backdrop-blur-sm group ${
      workshop.status === 'ENDED' ? 'opacity-80 grayscale-[0.3]' : 'hover:shadow-[0_0_20px_rgba(39,88,79,0.15)] hover:border-[#27584F]/50'
    }`}>
      <div className={`p-6 border-b border-[#27584F]/10 transition-colors ${
        workshop.status === 'ENDED' ? 'bg-zinc-900/10' : 'bg-[#27584F]/5 group-hover:bg-[#27584F]/10'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#27584F] font-medium">
            <Calendar size={16} />
            <span className="text-sm">{formatDate(workshop.start_time)}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            workshop.status === 'LIVE' ? 'bg-red-500 text-white animate-pulse' : 
            workshop.status === 'ENDED' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-blue-500 text-white'
          }`}>
            {workshop.status === 'ENDED' ? (
              <span className="flex items-center gap-1">
                Ended {workshop.ended_at ? formatRelativeTime(workshop.ended_at) : ''}
              </span>
            ) : workshop.status}
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#27584F] group-hover:text-[#27584F]/80 transition-colors">{workshop.title}</h3>
      </div>

      <CardContent className="p-6">
        {workshop.status === 'ENDED' ? (
          workshop.recording_url ? (
            <div className="mb-6 rounded-lg overflow-hidden border border-[#27584F]/20 shadow-inner bg-black/5">
              <VodPlayer url={workshop.recording_url} title={workshop.title} />
              <div className="p-3 bg-zinc-900/50 backdrop-blur-sm border-t border-[#27584F]/10 flex justify-between items-center">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Video size={12} /> Recording Available
                </span>
                <span className="text-[10px] text-zinc-500 italic">
                  Ended {workshop.ended_at ? formatRelativeTime(workshop.ended_at) : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-8 rounded-lg border border-dashed border-[#27584F]/30 bg-[#27584F]/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#27584F]/10 flex items-center justify-center mb-3 animate-pulse">
                <Clock className="text-[#27584F]" size={24} />
              </div>
              <h4 className="font-semibold text-[#27584F]">Recording Processing</h4>
              <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                The session has ended. We're currently processing the recording for you.
              </p>
            </div>
          )
        ) : (
          <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">{workshop.description}</p>
        )}

        {workshop.status === 'SCHEDULED' && !joinedWaitlist && (
          <form onSubmit={handleJoinWaitlist} className="mb-6 space-y-3">
            <p className="text-sm font-medium text-foreground">Get notified when we go live:</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-background border border-[#27584F]/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#27584F]/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={isJoiningWaitlist}
                className="bg-[#27584F]/80 hover:bg-[#27584F] text-white"
              >
                <Bell size={14} className="mr-1" />
                Notify Me
              </Button>
            </div>
          </form>
        )}

        {joinedWaitlist && (
          <div className="mb-6 p-3 bg-[#27584F]/10 border border-[#27584F]/30 rounded-md text-[#27584F] text-sm text-center font-medium">
            ✅ You're on the waitlist! We'll email you when we go live.
          </div>
        )}

        {workshop.status !== 'ENDED' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[11px] h-8 bg-[#18181b] border-[#27584F]/30 text-zinc-300 hover:bg-zinc-800"
              onClick={() => window.open(google(event), '_blank')}
            >
              <CalendarPlus size={14} className="mr-1" />
              Google Cal
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[11px] h-8 bg-[#18181b] border-[#27584F]/30 text-zinc-300 hover:bg-zinc-800"
              onClick={() => window.open(outlook(event), '_blank')}
            >
              Outlook
            </Button>
          </div>
        )}

        <div className="flex gap-3">
          {workshop.status === 'LIVE' ? (
            <Button className="flex-1 gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-red-500/20 py-6 text-lg font-bold" asChild>
              <a href={`/conclave/${workshop.id}`}>
                <Video size={20} />
                Join Live Now
              </a>
            </Button>
          ) : workshop.status === 'ENDED' ? (
            <Button 
              disabled={!workshop.recording_url} 
              className={`flex-1 gap-2 py-6 text-lg font-bold ${workshop.recording_url ? 'bg-[#27584F] hover:bg-[#27584F]/90 shadow-lg shadow-[#27584F]/20' : 'bg-zinc-800 text-zinc-500'} text-white shadow-sm`} 
              asChild={!!workshop.recording_url}
            >
              {workshop.recording_url ? (
                <a href={`/workshops/${workshop.id}/watch`}>
                  <PlayCircle size={20} />
                  Watch Recording
                </a>
              ) : (
                <span>
                  <Video size={20} className="inline mr-2" />
                  Session Finished
                </span>
              )}
            </Button>
          ) : (
            <Button disabled className="flex-1 gap-2 bg-zinc-800 text-zinc-500 py-6 text-lg font-bold cursor-not-allowed">
              <Clock size={20} />
              Starting Soon
            </Button>
          )}
          
          {isHost && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="w-12 h-auto bg-[#18181b]/50 border-[#27584F]/30 text-[#27584F] hover:bg-[#27584F]/10" 
                asChild
              >
                <a href={`/workshops/${workshop.id}/edit`} title="Edit Conclave">
                  <span className="text-xs font-bold">Edit</span>
                </a>
              </Button>
              {workshop.status === 'LIVE' && (
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="w-12 h-auto bg-red-950/30 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  onClick={handleEndWorkshop}
                  disabled={isEnding}
                  title="End Conclave"
                >
                  <div className="flex flex-col items-center">
                    <Square size={14} fill="currentColor" className="mb-0.5" />
                    <span className="text-[10px] font-bold">{isEnding ? '...' : 'End'}</span>
                  </div>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon"
                className="w-12 h-auto bg-[#18181b]/50 border-[#27584F]/30 text-[#27584F] hover:bg-[#27584F]/10" 
                onClick={handleArchiveToggle}
                disabled={isArchiving}
                title={workshop.is_archived ? 'Unarchive Conclave' : 'Archive Conclave'}
              >
                <div className="flex flex-col items-center">
                  <Archive size={14} fill="currentColor" className="mb-0.5" />
                  <span className="text-[10px] font-bold">{isArchiving ? '...' : (workshop.is_archived ? 'Unarchive' : 'Archive')}</span>
                </div>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

