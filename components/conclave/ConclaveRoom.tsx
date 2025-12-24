'use client'

import { LiveKitRoom } from '@livekit/components-react'
import { useMemo } from 'react'
import AudioConclaveView from './stages/AudioConclaveView'
import VideoStage from './stages/VideoStage'
import { ConclaveChat } from './chat/ConclaveChat'
import { ParticipantList } from './ParticipantList'
import '@livekit/components-styles'

interface ConclaveRoomProps {
  token: string
  serverUrl: string
  workshop: {
    id: string
    title: string
    type: 'AUDIO' | 'VIDEO'
    host_id: string
  }
  userId: string
  onEndLive: () => Promise<boolean | void>
}

export default function ConclaveRoom({
  token,
  serverUrl,
  workshop,
  userId,
  onEndLive
}: ConclaveRoomProps) {
  const isHost = workshop.host_id === userId
  const roomName = `conclave-${workshop.id}`

  return (
    <div className="relative w-full h-[700px] flex flex-col gap-4">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        connect={true}
        className="flex-1 flex flex-col"
      >
        <div className="flex flex-1 relative">
          <div className="flex-1">
            {workshop.type === 'AUDIO' ? (
              <AudioConclaveView onLeave={onEndLive} />
            ) : (
              <VideoStage />
            )}
          </div>
          <div className="w-30 ml-4 flex flex-col gap-4">
            <ConclaveChat workshopId={workshop.id} isHost={isHost} />
            <ParticipantList workshopId={workshop.id} isHost={isHost} />
          </div>
        </div>

      </LiveKitRoom>
    </div>
  )
}

