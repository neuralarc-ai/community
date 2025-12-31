'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, toZonedTime } from 'date-fns-tz'
import { formatDistanceToNowStrict } from 'date-fns'
import { Calendar, Clock, Users, Video, Bell, CalendarPlus, Square, PlayCircle, Archive, Share2, User as UserIcon, X, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { google, outlook, office365, yahoo, ics, CalendarEvent } from 'calendar-link'
import { createClient } from '@/app/lib/supabaseClient'
import VodPlayer from '@/app/components/VodPlayer'
import { Workshop } from '@/app/types'

const formatDateTimeLocal = (isoString: string) => {
  const date = toZonedTime(isoString, Intl.DateTimeFormat().resolvedOptions().timeZone)
  return format(date, 'MMM d, h:mm a', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for server-side rendering
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL
  }
  throw new Error(
    'NEXT_PUBLIC_FRONTEND_URL is not set. Please set it in your .env.local file or Vercel environment variables.'
  )
}

interface WorkshopCardProps {
  workshop: Workshop
  isHost: boolean
  currentUserId?: string // Pass the current user's ID to determine waitlist status
}

export default function WorkshopCard({ workshop: initialWorkshop, isHost, currentUserId }: WorkshopCardProps) {
  const [workshop, setWorkshop] = useState<Workshop>(initialWorkshop)
  const [email, setEmail] = useState('')
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false)
  const [joinedWaitlist, setJoinedWaitlist] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0) // Initialize to 0

  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const conclaveLink = `${getBaseUrl()}/conclave/${workshop.id}`

  // Polling for workshop status updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('workshops')
          .select('status') // Only select status
          .eq('id', workshop.id)
          .single()

        if (error) {
          // Check if it's a "not found" error (workshop deleted or inaccessible)
          if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
            // Workshop is no longer accessible, stop polling
            console.warn('Workshop no longer accessible, stopping status polling')
            clearInterval(interval)
            return
          }
          // Log other real errors but don't spam the console
          console.warn('Workshop status polling error:', error.message || 'Unknown error')
          return
        }

        if (data) {
          if (data.status !== workshop.status) {
            setWorkshop(prev => ({ ...prev, status: data.status }))
          }
        }
      } catch (err) {
        // Handle any unexpected errors in the polling logic
        console.warn('Unexpected error in workshop polling:', err)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [workshop.id, workshop.status, supabase])

  // Fetch waitlist count on load and when workshop.id changes
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      const { count, error } = await supabase
        .from('workshop_waitlist')
        .select('*', { count: 'exact' })
        .eq('workshop_id', workshop.id);

      if (error) {
        console.error('Error fetching waitlist count:', error);
        setWaitlistCount(0);
      } else {
        setWaitlistCount(count || 0);
      }
    };
    fetchWaitlistCount();
  }, [workshop.id, supabase]);

  // Check if current user is already on the waitlist on load
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      // Only check if email is available (for anonymous waitlist)
      if (email) {
        const { data, error } = await supabase
          .from('workshop_waitlist')
          .select('*')
          .eq('workshop_id', workshop.id)
          .eq('user_email', email) 
          .single()

        if (data) {
          setJoinedWaitlist(true)
        } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error checking waitlist status:', error)
        }
      }
    }
    // Call immediately if email is present. The effect will re-run if 'email' changes.
    if (email) {
      checkWaitlistStatus()
    }
  }, [workshop.id, supabase, email])

  const event: CalendarEvent = {
    title: workshop.title,
    description: workshop.description || '',
    start: workshop.start_time,
    duration: [1, 'hour'], // Default 1 hour
    url: conclaveLink,
  }

  const handleStartConclave = async () => {
    setIsStarting(true)
    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LIVE' }),
      })

      if (!response.ok) {
        throw new Error('Failed to start conclave')
      }

      setWorkshop(prev => ({ ...prev, status: 'LIVE' }))
      router.push(`/conclave/${workshop.id}`)
    } catch (error) {
      console.error('Error starting conclave:', error)
      toast({
        title: 'Error',
        description: 'Failed to start conclave. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsStarting(false)
    }
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

      setWorkshop(prev => ({ ...prev, status: 'ENDED' }))
      router.refresh()
    } catch (error) {
      console.error('Error ending workshop:', error)
      toast({
        title: 'Error',
        description: 'Failed to end conclave. Please try again.',
        variant: 'destructive',
      })
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

      setWorkshop(prev => ({ ...prev, is_archived: !prev.is_archived }))
      router.refresh()
    } catch (error) {
      console.error('Error archiving/unarchiving workshop:', error)
      toast({
        title: 'Error',
        description: `Failed to ${workshop.is_archived ? 'unarchive' : 'archive'} conclave. Please try again.`,
        variant: 'destructive',
      })
    } finally {
      setIsArchiving(false)
    }
  }

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast({
        title: 'Error',
        description: 'Email address cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedEmail.includes(',')) {
      toast({
        title: 'Error',
        description: 'Please enter only one email address at a time.',
        variant: 'destructive',
      });
      return;
    }

    setIsJoiningWaitlist(true)
    try {
      const response = await fetch(`/api/workshops/${workshop.id}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await response.json()

      if (response.ok || (response.status === 200 && data.message === 'You are already on the waitlist.')) {
        setJoinedWaitlist(true)
        if (response.status === 201) {
            setWaitlistCount(prev => prev + 1)
        }
        setEmail('')
        toast({
          title: 'Success',
          description: '✅ You\'re on the waitlist! We\'ll email you when we go live.',
        })
      } else {
        throw new Error(data.error || 'Failed to join waitlist');
      }
    } catch (error: any) {
      console.error('Error joining waitlist:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to join waitlist. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsJoiningWaitlist(false)
    }
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(conclaveLink)
    toast({
      title: 'Link Copied!',
      description: 'The conclave link has been copied to your clipboard.',
    })
  }

  const handleDeleteConclave = async () => {
    if (!confirm('Are you sure you want to delete this conclave? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workshops/${workshop.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to delete conclave');
      }

      toast({
        title: 'Success',
        description: 'Conclave deleted successfully.',
      });
      router.push('/workshops'); // Redirect to workshops page after deletion
      router.refresh();
    } catch (error) {
      console.error('Error deleting conclave:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conclave. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNotifyConclaveUsers = async () => {
    try {
      const response = await fetch('/api/notify/conclave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workshopId: workshop.id }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          toast({
            title: "Error!",
            description: errorData.message || "Failed to send conclave invitations.",
            variant: "destructive",
          });
        } else {
          const errorText = await response.text();
          toast({
            title: "Error!",
            description: `Server error: ${response.status} ${response.statusText} - ${errorText}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to notify conclave users:', error);
      toast({
        title: "Error!",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const isScheduled = workshop.status === 'SCHEDULED'
  const isLive = workshop.status === 'LIVE'
  const isEnded = workshop.status === 'ENDED'

  return (
    <Card className={`overflow-hidden border-[#27584F]/50 shadow-sm transition-all duration-300 bg-card/40 backdrop-blur-sm group ${
      isEnded ? 'opacity-80 grayscale-[0.3]' : 'hover:shadow-[0_0_20px_rgba(39,88,79,0.15)] hover:border-[#27584F]/50'
    } font-manrope`}> {/* Apply Body Font */}
      <div className={`p-6 border-b border-[#27584F]/10 transition-colors ${
        isEnded ? 'bg-zinc-900/10' : 'bg-[#27584F]/5 group-hover:bg-[#27584F]/10'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white font-medium">
            <Calendar size={16} />
            <span className="text-sm">{formatDateTimeLocal(workshop.start_time)}</span> {/* UI Fix: Date & Time Display */}
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              workshop.type === 'AUDIO' ? 'bg-teal-500 text-white' : 'bg-teal-500 text-white'
            }`}>
              {workshop.type}
            </div>
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isLive ? 'bg-red-500 text-white animate-pulse' : 
            isEnded ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-blue-500 text-white'
          }`}>
            {isEnded ? (
              <span className="flex items-center gap-1">
                Ended {workshop.ended_at ? formatDistanceToNowStrict(new Date(workshop.ended_at), { addSuffix: true }) : ''}
              </span>
            ) : workshop.status}
            </div>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-white/90 transition-colors font-sora">{workshop.title}</h3> {/* Apply Header Font */}
      </div>

      <CardContent className="p-6">
        {isEnded ? (
          workshop.recording_url ? (
            <div className="mb-6 rounded-lg overflow-hidden border border-[#27584F]/20 shadow-inner bg-black/5">
              <VodPlayer url={workshop.recording_url} title={workshop.title} />
              <div className="p-3 bg-zinc-900/50 backdrop-blur-sm border-t border-[#27584F]/10 flex justify-between items-center">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Video size={12} /> Recording Available
                </span>
                <span className="text-[10px] text-zinc-500 italic">
                  Ended {workshop.ended_at ? formatDistanceToNowStrict(new Date(workshop.ended_at), { addSuffix: true }) : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-8 rounded-lg border border-dashed border-[#27584F]/30 bg-[#27584F]/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#27584F]/10 flex items-center justify-center mb-3 animate-pulse">
                <Clock className="w-8 h-8 text-[#27584F]" />
              </div>
              <h4 className="font-semibold text-white font-sora">Recording Processing</h4>
              <p className="text-xs text-muted-foreground max-w-[200px] mt-1 font-manrope">
                The session has ended. We're currently processing the recording for you.
              </p>
            </div>
          )
        ) : (
          <p className="text-white/80 mb-6 leading-relaxed line-clamp-3 font-manrope">{workshop.description}</p>
        )}

        {/* Share Button */}
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[11px] h-8 bg-[#18181b] border-[#27584F]/30 text-zinc-300 hover:bg-zinc-800"
            onClick={handleShareLink}
          >
            <Share2 size={14} className="mr-1" />
            Share Conclave
          </Button>
          {isScheduled && waitlistCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-zinc-400">
              <UserIcon size={14} />
              <span>{waitlistCount} people waiting</span>
            </div>
          )}
        </div>


        {joinedWaitlist && isScheduled && (
          <div className="mb-6 p-3 bg-[#27584F]/10 border border-[#27584F]/30 rounded-md text-[#27584F] text-sm text-center font-medium font-manrope">
            ✅ You\'re on the waitlist! We\'ll email you when we go live.
          </div>
        )}

        {/* Add to Calendar buttons (unchanged for now) */}
        {workshop.status !== 'ENDED' && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[11px] h-8 bg-[#18181b] border-[#27584F]/30 text-zinc-300 hover:bg-zinc-800 font-manrope"
              onClick={() => window.open(google(event), '_blank')}
            >
              <CalendarPlus size={14} className="mr-1" />
              Google Cal
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[11px] h-8 bg-[#18181b] border-[#27584F]/30 text-zinc-300 hover:bg-zinc-800 font-manrope"
              onClick={() => window.open(outlook(event), '_blank')}
            >
              Outlook
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {isHost ? (
            <>
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                {isScheduled && (
                  <Button 
                    className="w-fit gap-2 bg-[#27584F] hover:bg-[#27584F]/90 text-white shadow-lg shadow-[#27584F]/20 py-4 text-base font-bold font-sora"
                    onClick={handleStartConclave}
                    disabled={isStarting}
                  >
                    <PlayCircle className="w-8 h-8" />
                    {isStarting ? 'Starting...' : 'Start Conclave'}
                  </Button>
                )}
                {isLive && (
                  <Button className="w-full sm:w-auto gap-2 bg-[#27584F] hover:bg-[#27584F]/90 text-white shadow-lg shadow-[#27584F]/20 py-4 text-base font-bold font-sora" asChild>
                    <a href={`/conclave/${workshop.id}`}>
                      <Video className="w-8 h-8" />
                      Join as Host
                    </a>
                  </Button>
                )}
                {isEnded && (
                  <Button 
                    disabled={!workshop.recording_url} 
                    className={`w-full sm:w-auto gap-2 py-4 text-base font-bold font-sora ${workshop.recording_url ? 'bg-[#27584F] hover:bg-[#27584F]/90 shadow-lg shadow-[#27584F]/20' : 'bg-zinc-800 text-zinc-500'} text-white shadow-sm`} 
                    asChild={!!workshop.recording_url}
                  >
                    {workshop.recording_url ? (
                      <a href={`/workshops/${workshop.id}/watch`}>
                        <PlayCircle className="w-8 h-8" />
                        Watch Recording
                      </a>
                    ) : (
                      <span>
                        <Video className="w-8 h-8 inline mr-2" />
                        Session Finished
                      </span>
                    )}
                  </Button>
                )}
                {/* Notify Users Button */}
                {isScheduled && (
                  <Button 
                    className="w-fit gap-2 bg-[#27584F] hover:bg-[#27584F]/90 text-white shadow-lg shadow-[#27584F]/20 py-4 text-base font-bold font-sora"
                    onClick={handleNotifyConclaveUsers}
                  >
                    <Bell className="w-8 h-8" />
                    Notify Users
                  </Button>
                )}
                {isLive && (
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
              </div>
              <div className="flex flex-row gap-2 mt-2">
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
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="w-12 h-auto bg-red-950/30 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  onClick={handleDeleteConclave}
                  title="Delete Conclave"
                >
                  <div className="flex flex-col items-center">
                    <X size={14} fill="currentColor" className="mb-0.5" />
                    <span className="text-[10px] font-bold">Delete</span>
                  </div>
                </Button>
              </div>
            </>
          ) : ( /* Attendee Logic */
            <>
              {isScheduled && (
                <Button disabled className="w-full sm:w-auto gap-2 bg-zinc-800 text-zinc-500 py-4 text-base font-bold cursor-not-allowed font-sora">
                  <Clock className="w-8 h-8" />
                  Event Scheduled
                </Button>
              )}
              {isLive && (
                <Button className="w-full sm:w-auto gap-2 bg-[#27584F] hover:bg-[#27584F]/90 text-white shadow-lg shadow-[#27584F]/20 py-4 text-base font-bold font-sora" asChild>
                    <a href={`/conclave/${workshop.id}`}>
                      <Video className="w-8 h-8" />
                      Join Now
                    </a>
                  </Button>
              )}
              {isEnded && (
                <Button 
                  disabled={!workshop.recording_url} 
                  className={`w-full sm:w-auto gap-2 py-4 text-base font-bold font-sora ${workshop.recording_url ? 'bg-[#27584F] hover:bg-[#27584F]/90 shadow-lg shadow-[#27584F]/20' : 'bg-zinc-800 text-zinc-500'} text-white shadow-sm`} 
                  asChild={!!workshop.recording_url}
                >
                  {workshop.recording_url ? (
                    <a href={`/workshops/${workshop.id}/watch`}>
                      <PlayCircle className="w-8 h-8" />
                      Watch Recording
                    </a>
                  ) : (
                    <span>
                        <Video className="w-8 h-8 inline mr-2" />
                      Session Finished
                    </span>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>

      {/* Success Modal for Conclave Notifications */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-[#27584F]/10 border border-[#27584F] text-white p-6 rounded-2xl shadow-xl backdrop-blur-xl">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-[#27584F]" />
            <DialogTitle className="text-2xl font-bold text-white">Email was successfully sent!</DialogTitle>
            <DialogDescription className="text-zinc-400 text-base">
              Your conclave invitation emails have been successfully dispatched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" className="w-full bg-[#27584F] hover:bg-[#27584F]/90 text-white font-bold py-3 rounded-xl transition-colors duration-200">
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
