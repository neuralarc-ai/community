'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  AudioConference,
  useRoomContext,
} from '@livekit/components-react'
import '@livekit/components-styles'
import { Track } from 'livekit-client'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Video, VideoOff, Circle, Square, Mail } from 'lucide-react'
import ConclaveControls from '@/components/conclave/controls/ConclaveControls'

interface LiveRoomProps {
  workshopId: string
  roomName: string
  participantName: string
  isHost: boolean
  mode: 'video' | 'audio'
  onEndLive: () => Promise<boolean>
}

export default function LiveRoom({
  workshopId,
  roomName,
  participantName,
  isHost,
  mode,
  onEndLive,
}: LiveRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [egressId, setEgressId] = useState<string | null>(null)
  const [isNotifying, setIsNotifying] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const router = useRouter()
  const room = useRoomContext()

  const handleDisconnectAndNotifyParent = async () => {
    if (room) {
      await room.disconnect()
    }
    onEndLive()
  }

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, participantName, workshopId }),
        })
        const data = await response.json()
        setToken(data.token)
        setServerUrl(data.serverUrl)
      } catch (error) {
        console.error('Error fetching token:', error)
      }
    }

    fetchToken()
  }, [roomName, participantName, workshopId])

  const handleToggleRecording = async () => {
    if (!isRecording) {
      try {
        const response = await fetch('/api/livekit/start-recording', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, workshopId }),
        })
        const data = await response.json()
        if (data.egressId) {
          setEgressId(data.egressId)
          setIsRecording(true)
        }
      } catch (error) {
        console.error('Error starting recording:', error)
      }
    } else {
      try {
        await fetch(`/api/livekit/start-recording?egressId=${egressId}&workshopId=${workshopId}`, {
          method: 'DELETE',
        })
        setIsRecording(false)
        setEgressId(null)
      } catch (error) {
        console.error('Error stopping recording:', error)
      }
    }
  }

  const handleNotifyWaitlist = async () => {
    setIsNotifying(true)
    try {
      const response = await fetch('/api/email/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId }),
      })
      const data = await response.json()
      alert(data.message || 'Notifications sent!')
    } catch (error) {
      console.error('Error notifying waitlist:', error)
      alert('Failed to send notifications.')
    } finally {
      setIsNotifying(false)
    }
  }

  const handleEndWorkshop = async () => {
    setIsEnding(true)
    try {
      const success = await onEndLive()
      if (success) {
        // Disconnect from the room if ending was successful
        if (room) {
          await room.disconnect()
        }
      }
    } catch (error) {
      console.error('Error ending workshop:', error)
    } finally {
      setIsEnding(false)
    }
  }


  if (!token || !serverUrl) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-black text-white rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] bg-background rounded-xl overflow-hidden border border-border">
      {isHost && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            size="sm"
            variant={isRecording ? 'destructive' : 'default'}
            className="gap-2"
            onClick={handleToggleRecording}
          >
            {isRecording ? <Square size={16} fill="currentColor" /> : <Circle size={16} fill="currentColor" />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            onClick={handleNotifyWaitlist}
            disabled={isNotifying}
          >
            <Mail size={16} />
            {isNotifying ? 'Sending...' : 'Notify Waitlist'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-2"
            onClick={handleEndWorkshop}
            disabled={isEnding}
          >
            <Square size={16} fill="currentColor" />
            {isEnding ? 'Ending Conclave...' : 'End Conclave'}
          </Button>
        </div>
      )}

      <LiveKitRoom
        video={mode === 'video'}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        {mode === 'video' ? (
          <VideoConference />
        ) : (
          <AudioConference />
        )}
      </LiveKitRoom>
    </div>
  )
}

