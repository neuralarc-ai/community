'use client'

import { useState, useMemo } from 'react'
import { 
  useLocalParticipant, 
  useRemoteParticipants, 
  useRoomContext,
} from '@livekit/components-react'
import { 
  Mic, MicOff, Video, VideoOff, Hand, 
  Users, Radio, Square, ShieldCheck, X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConclaveControlsProps {
  workshopId: string
  roomName: string
  isHost: boolean
  type: 'AUDIO' | 'VIDEO'
}

export default function ConclaveControls({ 
  workshopId, 
  roomName, 
  isHost, 
  type 
}: ConclaveControlsProps) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const remoteParticipants = useRemoteParticipants()
  const [isRecording, setIsRecording] = useState(false)
  const [egressId, setEgressId] = useState<string | null>(null)
  const [showManagePanel, setShowManagePanel] = useState(false)

  // Parse local metadata for handRaised status
  const metadata = useMemo(() => {
    try {
      return JSON.parse(localParticipant.metadata || '{}')
    } catch {
      return {}
    }
  }, [localParticipant.metadata])

  // Get list of participants who have raised their hands
  const handRaisers = useMemo(() => {
    return remoteParticipants.filter(p => {
      try {
        const meta = JSON.parse(p.metadata || '{}')
        return meta.handRaised === true
      } catch {
        return false
      }
    })
  }, [remoteParticipants])

  const toggleHand = async () => {
    const newMetadata = JSON.stringify({
      ...metadata,
      handRaised: !metadata.handRaised
    })
    await localParticipant.setMetadata(newMetadata)
  }

  const handleGoLive = async () => {
    try {
      const res = await fetch('/api/livekit/start-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, workshopId, type })
      })
      const data = await res.json()
      if (data.egressId) {
        setEgressId(data.egressId)
        setIsRecording(true)
      }
    } catch (err) {
      console.error('Failed to go live', err)
    }
  }

  const manageParticipant = async (identity: string, action: 'promote' | 'demote' | 'remove') => {
    try {
      await fetch('/api/livekit/manage-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, workshopId, identity, action })
      })
    } catch (err) {
      console.error('Failed to manage participant', err)
    }
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50">
      
      {/* Mic/Video Toggles */}
      {(localParticipant.trackPublications.size > 0 || isHost) && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className={`rounded-full h-10 w-10 ${!localParticipant.isMicrophoneEnabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-white hover:bg-white/10'}`}
            onClick={() => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)}
          >
            {localParticipant.isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>

          {type === 'VIDEO' && (
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full h-10 w-10 ${!localParticipant.isCameraEnabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-white hover:bg-white/10'}`}
              onClick={() => localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled)}
            >
              {localParticipant.isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>
          )}
        </>
      )}

      {/* Listener Specific: Raise Hand */}
      {!isHost && (
        <Button
          variant="ghost"
          className={`gap-2 h-10 rounded-full transition-all ${metadata.handRaised ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'text-white hover:bg-white/10'}`}
          onClick={toggleHand}
        >
          <Hand size={20} fill={metadata.handRaised ? "currentColor" : "none"} />
          <span className="hidden sm:inline font-medium">{metadata.handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
        </Button>
      )}

      <div className="w-[1px] h-6 bg-white/10 mx-1" />

      {/* Host Specific: Management */}
      {isHost && (
        <>
          <Button
            variant={isRecording ? "destructive" : "default"}
            className="rounded-full gap-2 px-6 h-10 font-bold"
            onClick={isRecording ? () => {} : handleGoLive}
          >
            {isRecording ? <Square size={16} fill="currentColor" /> : <Radio size={16} />}
            {isRecording ? 'LIVE' : 'GO LIVE'}
          </Button>

          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full h-10 w-10 text-white hover:bg-white/10 ${showManagePanel ? 'bg-white/20' : ''}`}
              onClick={() => setShowManagePanel(!showManagePanel)}
            >
              <Users size={20} />
              {handRaisers.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-black border-2 border-black">
                  {handRaisers.length}
                </span>
              )}
            </Button>

            {showManagePanel && (
              <div className="absolute bottom-14 right-0 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-4 border-b border-white/5 font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-400" />
                    <span>Manage Stage</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setShowManagePanel(false)}>
                    <X size={14} />
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {handRaisers.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-sm italic">No active requests</div>
                  ) : (
                    handRaisers.map((p) => (
                      <div key={p.identity} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{p.name || 'Anonymous'}</span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Wants to speak</span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            className="h-7 text-[10px] px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            onClick={() => manageParticipant(p.identity, 'promote')}
                          >
                            APPROVE
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-500"
                            onClick={() => manageParticipant(p.identity, 'remove')}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Leave Button */}
      <Button
        variant="destructive"
        size="icon"
        className="rounded-full h-10 w-10 bg-red-600 hover:bg-red-700"
        onClick={() => room.disconnect()}
      >
        <X size={20} />
      </Button>
    </div>
  )
}

