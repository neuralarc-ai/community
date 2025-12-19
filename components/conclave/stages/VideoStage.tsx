'use client'

import { 
  useParticipants, 
  useTracks,
  VideoTrack,
  RoomAudioRenderer,
  ParticipantTile,
  ParticipantContext,
  useParticipantContext,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useMemo } from 'react'
import Avatar from '@/app/components/Avatar'
import { MicOff } from 'lucide-react'

export default function VideoStage() {
  const participants = useParticipants()
  
  // Find the most active speaker or the host to spotlight
  const spotlightParticipant = useMemo(() => {
    // 1. Check for active speaker
    const speaker = participants.find(p => p.isSpeaking)
    if (speaker) return speaker

    // 2. Check for host
    const host = participants.find(p => {
      try {
        const meta = JSON.parse(p.metadata || '{}')
        return meta.role === 'host'
      } catch {
        return false
      }
    })
    if (host) return host

    // 3. Fallback to first participant
    return participants[0]
  }, [participants])

  const sidebarParticipants = participants.filter(p => p.identity !== spotlightParticipant?.identity)

  return (
    <div className="flex h-full w-full gap-4 bg-zinc-950 rounded-3xl overflow-hidden p-4">
      {/* Main Spotlight Area */}
      <div className="flex-[3] relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
        {spotlightParticipant ? (
          <SpotlightTile participant={spotlightParticipant} />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 italic">
            Waiting for speakers...
          </div>
        )}
      </div>

      {/* Sidebar Participants */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {sidebarParticipants.map(p => (
          <div key={p.identity} className="aspect-video relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
            <SidebarTile participant={p} />
          </div>
        ))}
      </div>

      <RoomAudioRenderer />
    </div>
  )
}

function SpotlightTile({ participant }: { participant: any }) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)

  return (
    <div className="h-full w-full relative">
      {cameraTrack ? (
        <VideoTrack trackRef={cameraTrack} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
          <Avatar
            src={undefined}
            alt={participant.name || participant.identity}
            size={128}
            className="w-32 h-32 border-4 border-white/10"
          />
        </div>
      )}
      
      {/* Overlay Info */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <span className="text-white font-bold text-sm">{participant.name || 'Speaker'}</span>
        {!participant.isMicrophoneEnabled && (
          <MicOff size={16} className="text-red-500" />
        )}
      </div>
    </div>
  )
}

function SidebarTile({ participant }: { participant: any }) {
  const tracks = useTracks([Track.Source.Camera])
  const cameraTrack = tracks.find(t => t.participant.identity === participant.identity)

  return (
    <div className="h-full w-full relative group">
      {cameraTrack ? (
        <VideoTrack trackRef={cameraTrack} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-zinc-800">
          <Avatar
            src={undefined}
            alt={participant.name || participant.identity}
            size={48}
            className="w-12 h-12"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium border border-white/5">
        {participant.name || 'Member'}
      </div>
    </div>
  )
}

