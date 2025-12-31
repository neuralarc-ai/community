'use client'

import { 
  useParticipants, 
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
  ParticipantTile,
  ParticipantContext,
  useParticipantContext,
  useLocalParticipant,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useMemo, useEffect, useState } from 'react'
import Avatar from '@/app/components/Avatar'
import { MicOff, Pin, PinOff } from 'lucide-react'
import { createClient } from '@/app/lib/supabaseClient'
import { useSpotlight } from '@/app/hooks/useSpotlight'
import { Button } from '@/components/ui/button'

interface VideoStageProps {
  workshopId?: string
}

export default function VideoStage({ workshopId }: VideoStageProps = {}) {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  
  // Parse local participant metadata to check if user is host/admin
  const localParticipantMetadata = useMemo(() => {
    try {
      return JSON.parse(localParticipant?.metadata || '{}')
    } catch {
      return {}
    }
  }, [localParticipant?.metadata])

  const isHostOrAdmin = localParticipantMetadata.role === 'host' || localParticipantMetadata.role === 'admin'
  
  // Use database spotlight if workshopId is provided
  const { currentSpotlightId, setSpotlight } = workshopId 
    ? useSpotlight(workshopId) 
    : { currentSpotlightId: null, setSpotlight: async () => {} }
  
  const [isUpdatingSpotlight, setIsUpdatingSpotlight] = useState(false)

  // CRITICAL FIX: When database spotlight is set, ONLY use that. No fallback to auto-detection.
  const spotlightParticipant = useMemo(() => {
    // If database spotlight is set, ONLY use that participant (or null if not found)
    if (currentSpotlightId) {
      const dbSpotlight = participants.find(p => p.identity === currentSpotlightId)
      return dbSpotlight || null // Return null if participant not found yet, don't fallback
    }

    // Only use auto-detection when NO database spotlight is set
    // Check for active speaker
    const speaker = participants.find(p => p.isSpeaking)
    if (speaker) return speaker

    // Check for host
    const host = participants.find(p => {
      try {
        const meta = JSON.parse(p.metadata || '{}')
        return meta.role === 'host'
      } catch {
        return false
      }
    })
    if (host) return host

    // Fallback to first participant
    return participants[0] || null
  }, [participants, currentSpotlightId])

  const handlePinClick = async (userId: string) => {
    if (!workshopId || isUpdatingSpotlight) return
    
    setIsUpdatingSpotlight(true)
    try {
      await setSpotlight(currentSpotlightId === userId ? null : userId)
    } catch (error) {
      console.error('Error updating spotlight:', error)
    } finally {
      setIsUpdatingSpotlight(false)
    }
  }

  const handleUnpinClick = async () => {
    if (!workshopId || isUpdatingSpotlight) return
    
    setIsUpdatingSpotlight(true)
    try {
      await setSpotlight(null)
    } catch (error) {
      console.error('Error unpinning spotlight:', error)
    } finally {
      setIsUpdatingSpotlight(false)
    }
  }

  // CRITICAL: If database spotlight is set, ALWAYS show spotlight view (even if participant hasn't joined yet)
  // This ensures global sync - all users see the same view
  if (currentSpotlightId) {
    const sidebarParticipants = spotlightParticipant 
      ? participants.filter(p => p.identity !== spotlightParticipant.identity)
      : participants;

    return (
      <div className="flex h-full w-full gap-4 bg-zinc-950 rounded-3xl overflow-hidden p-4">
        {/* Main Spotlight Area */}
        <div className="flex-[3] relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
          {/* Show placeholder if database spotlight is set but participant hasn't joined yet */}
          {!spotlightParticipant ? (
            <div className="flex items-center justify-center h-full text-zinc-500 italic">
              Waiting for spotlighted participant to join...
            </div>
          ) : (
            <SpotlightTile 
              participant={spotlightParticipant}
              isHostOrAdmin={isHostOrAdmin && !!workshopId}
              onUnpin={handleUnpinClick}
              isUpdating={isUpdatingSpotlight}
            />
          )}
        </div>

        {/* Sidebar Participants */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {sidebarParticipants.map(p => (
            <div key={p.identity} className="aspect-video relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 group">
              <SidebarTile 
                participant={p}
                isHostOrAdmin={isHostOrAdmin && !!workshopId}
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

  // Show grid view when no database spotlight is set (fallback to auto-detection or grid)
  if (!spotlightParticipant) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full p-4 overflow-y-auto">
          {participants.map(participant => (
            <div key={participant.identity} className="aspect-video relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 group">
              <SidebarTile 
                participant={participant}
                isHostOrAdmin={isHostOrAdmin && !!workshopId}
                onPinClick={() => handlePinClick(participant.identity)}
                isUpdating={isUpdatingSpotlight}
              />
            </div>
          ))}
        </div>
        <RoomAudioRenderer />
      </>
    )
  }

  // Auto-detection spotlight view (when no database spotlight but auto-detection found someone)
  const sidebarParticipants = participants.filter(p => p.identity !== spotlightParticipant.identity)

  return (
    <div className="flex h-full w-full gap-4 bg-zinc-950 rounded-3xl overflow-hidden p-4">
      {/* Main Spotlight Area */}
      <div className="flex-[3] relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
        <SpotlightTile 
          participant={spotlightParticipant}
          isHostOrAdmin={isHostOrAdmin && !!workshopId}
          onUnpin={handleUnpinClick}
          isUpdating={isUpdatingSpotlight}
        />
      </div>

      {/* Sidebar Participants */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {sidebarParticipants.map(p => (
          <div key={p.identity} className="aspect-video relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 group">
            <SidebarTile 
              participant={p}
              isHostOrAdmin={isHostOrAdmin && !!workshopId}
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
  isHostOrAdmin?: boolean
  onUnpin?: () => void
  isUpdating?: boolean
}) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch profile if participant.identity is a valid string
      if (!participant.identity || participant.identity === '') {
        setProfile(null);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username, full_name')
        .eq('id', participant.identity)
        .single();

      if (error) {
        console.error('Error fetching profile for spotlight participant:', JSON.stringify(error));
      } else {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [participant.identity]);

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
        <span className="text-white font-bold text-sm">{profile?.full_name || profile?.username || 'Speaker'}</span>
        {!participant.isMicrophoneEnabled && (
          <MicOff size={16} className="text-red-500" />
        )}
      </div>

      {/* Unpin Button (Host/Admin only) */}
      {isHostOrAdmin && onUnpin && (
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
  isHostOrAdmin?: boolean
  onPinClick?: () => void
  isUpdating?: boolean
}) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch profile if participant.identity is a valid string
      if (!participant.identity || participant.identity === '') {
        setProfile(null);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username, full_name')
        .eq('id', participant.identity)
        .single();

      if (error) {
        console.error('Error fetching profile for sidebar participant:', JSON.stringify(error));
      } else {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [participant.identity]);

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
      {isHostOrAdmin && onPinClick && (
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

