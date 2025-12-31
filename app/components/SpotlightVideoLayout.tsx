'use client'

import { 
  useParticipants, 
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useMemo, useEffect, useState } from 'react'
import Avatar from '@/app/components/Avatar'
import { MicOff, Pin, PinOff } from 'lucide-react'
import { createClient } from '@/app/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { useSpotlight } from '@/app/hooks/useSpotlight'

interface SpotlightVideoLayoutProps {
  workshopId: string
  isHostOrAdmin: boolean
}

export default function SpotlightVideoLayout({ 
  workshopId, 
  isHostOrAdmin 
}: SpotlightVideoLayoutProps) {
  const participants = useParticipants()
  const { currentSpotlightId, setSpotlight } = useSpotlight(workshopId)
  const [isUpdatingSpotlight, setIsUpdatingSpotlight] = useState(false)

  // Find the spotlighted participant by identity (which is the user ID)
  const spotlightParticipant = useMemo(() => {
    if (!currentSpotlightId) return null
    return participants.find(p => p.identity === currentSpotlightId) || null
  }, [participants, currentSpotlightId])

  // Get sidebar participants (all except the spotlighted one)
  const sidebarParticipants = useMemo(() => {
    if (!spotlightParticipant) return participants
    return participants.filter(p => p.identity !== spotlightParticipant.identity)
  }, [participants, spotlightParticipant])

  const handlePinClick = async (userId: string) => {
    if (isUpdatingSpotlight) return
    
    setIsUpdatingSpotlight(true)
    try {
      // If clicking the same user, unpin; otherwise, pin the new user
      await setSpotlight(currentSpotlightId === userId ? null : userId)
    } catch (error) {
      console.error('Error updating spotlight:', error)
    } finally {
      setIsUpdatingSpotlight(false)
    }
  }

  const handleUnpinClick = async () => {
    if (isUpdatingSpotlight) return
    
    setIsUpdatingSpotlight(true)
    try {
      await setSpotlight(null)
    } catch (error) {
      console.error('Error unpinning spotlight:', error)
    } finally {
      setIsUpdatingSpotlight(false)
    }
  }

  // If no spotlight is set, show grid view
  if (!currentSpotlightId || !spotlightParticipant) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full p-4 overflow-y-auto">
          {participants.map(participant => (
            <GridTile 
              key={participant.identity} 
              participant={participant}
              isHostOrAdmin={isHostOrAdmin}
              onPinClick={() => handlePinClick(participant.identity)}
              isUpdating={isUpdatingSpotlight}
            />
          ))}
        </div>
        <RoomAudioRenderer />
      </>
    )
  }

  // Spotlight view: main stage + sidebar
  return (
    <div className="flex h-full w-full gap-4 bg-zinc-950 rounded-3xl overflow-hidden p-4">
      {/* Main Spotlight Area */}
      <div className="flex-[3] relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
        <SpotlightTile 
          participant={spotlightParticipant} 
          isHostOrAdmin={isHostOrAdmin}
          onUnpin={handleUnpinClick}
          isUpdating={isUpdatingSpotlight}
        />
      </div>

      {/* Sidebar Participants */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {sidebarParticipants.map(p => (
          <div 
            key={p.identity} 
            className="aspect-video relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 group"
          >
            <SidebarTile 
              participant={p}
              isHostOrAdmin={isHostOrAdmin}
              onPinClick={() => handlePinClick(p.identity)}
              isUpdating={isUpdatingSpotlight}
            />
          </div>
        ))}
      </div>

      <RoomAudioRenderer />
    </div>
  )
}

function SpotlightTile({ 
  participant, 
  isHostOrAdmin,
  onUnpin,
  isUpdating
}: { 
  participant: any
  isHostOrAdmin: boolean
  onUnpin: () => void
  isUpdating: boolean
}) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!participant.identity || participant.identity === '') {
        setProfile(null)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username, full_name')
        .eq('id', participant.identity)
        .single()

      if (error) {
        console.error('Error fetching profile for spotlight participant:', error)
      } else {
        setProfile(data)
      }
    }
    fetchProfile()
  }, [participant.identity])

  return (
    <div className="h-full w-full relative">
      {cameraTrack ? (
        <VideoTrack trackRef={cameraTrack} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.username || profile?.full_name || 'User'}
            size={128}
            className="w-32 h-32 border-4 border-white/10"
          />
        </div>
      )}
      
      {/* Overlay Info */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <span className="text-white font-bold text-sm">
          {profile?.full_name || profile?.username || 'Speaker'}
        </span>
        {!participant.isMicrophoneEnabled && (
          <MicOff size={16} className="text-red-500" />
        )}
      </div>

      {/* Unpin Button (Host/Admin only) */}
      {isHostOrAdmin && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="sm"
            variant="destructive"
            onClick={onUnpin}
            disabled={isUpdating}
            className="gap-2"
          >
            <PinOff size={16} />
            {isUpdating ? 'Unpinning...' : 'Unpin'}
          </Button>
        </div>
      )}
    </div>
  )
}

function SidebarTile({ 
  participant, 
  isHostOrAdmin,
  onPinClick,
  isUpdating
}: { 
  participant: any
  isHostOrAdmin: boolean
  onPinClick: () => void
  isUpdating: boolean
}) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!participant.identity || participant.identity === '') {
        setProfile(null)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username, full_name')
        .eq('id', participant.identity)
        .single()

      if (error) {
        console.error('Error fetching profile for sidebar participant:', error)
      } else {
        setProfile(data)
      }
    }
    fetchProfile()
  }, [participant.identity])

  return (
    <div className="h-full w-full relative group">
      {cameraTrack ? (
        <VideoTrack trackRef={cameraTrack} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-800">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.username || profile?.full_name || 'User'}
            size={48}
            className="w-12 h-12"
          />
        </div>
      )}
      
      {/* Pin Button Overlay (Host/Admin only) */}
      {isHostOrAdmin && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="sm"
            variant="default"
            onClick={onPinClick}
            disabled={isUpdating}
            className="gap-2"
          >
            <Pin size={16} />
            Pin to Stage
          </Button>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium border border-white/5">
        {profile?.full_name || profile?.username || 'Member'}
      </div>
    </div>
  )
}

function GridTile({ 
  participant, 
  isHostOrAdmin,
  onPinClick,
  isUpdating
}: { 
  participant: any
  isHostOrAdmin: boolean
  onPinClick: () => void
  isUpdating: boolean
}) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!participant.identity || participant.identity === '') {
        setProfile(null)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username, full_name')
        .eq('id', participant.identity)
        .single()

      if (error) {
        console.error('Error fetching profile for grid participant:', error)
      } else {
        setProfile(data)
      }
    }
    fetchProfile()
  }, [participant.identity])

  return (
    <div className="relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 aspect-video group">
      {cameraTrack ? (
        <VideoTrack trackRef={cameraTrack} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-800">
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.username || profile?.full_name || 'User'}
            size={64}
            className="w-16 h-16"
          />
        </div>
      )}
      
      {/* Pin Button Overlay (Host/Admin only) */}
      {isHostOrAdmin && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="sm"
            variant="default"
            onClick={onPinClick}
            disabled={isUpdating}
            className="gap-2"
          >
            <Pin size={16} />
            Pin to Stage
          </Button>
        </div>
      )}
      
      {/* Participant Info */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium border border-white/5">
        {profile?.full_name || profile?.username || 'Member'}
      </div>
      
      {!participant.isMicrophoneEnabled && (
        <div className="absolute top-2 right-2">
          <MicOff size={16} className="text-red-500" />
        </div>
      )}
    </div>
  )
}

