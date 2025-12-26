'use client'

import { LiveKitRoom, useLocalParticipant, useRoomContext } from '@livekit/components-react'
import { useMemo } from 'react'
import AudioConclaveView from './stages/AudioConclaveView'
import VideoStage from './stages/VideoStage'
import { ConclaveChat } from './chat/ConclaveChat'
import { ParticipantList } from './ParticipantList'
import SidebarTabs from '../../app/components/conclave/SidebarTabs'
import ControlBar from '@/app/components/ControlBar'
import '@livekit/components-styles'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  userRole: string | null
  onEndLive: () => Promise<boolean | void>
  isSidebarOpen?: boolean
  roomName: string
}

// Inner component that uses LiveKit hooks - must be inside LiveKitRoom
function ConclaveRoomContent({
  workshop,
  isHost,
  userRole,
  onEndLive,
  isSidebarOpen,
  onToggleSidebar,
  roomName
}: {
  workshop: ConclaveRoomProps['workshop']
  isHost: boolean
  userRole: string | null
  onEndLive: () => Promise<boolean | void>
  isSidebarOpen?: boolean
  onToggleSidebar: () => void
  roomName: string
}) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()

  return (
    <>
      <div className="flex flex-1 relative">
        <div className="flex-1">
          {workshop.type === 'AUDIO' ? (
            <AudioConclaveView onLeave={onEndLive} userRole={userRole} />
          ) : (
            <VideoStage />
          )}
        </div>

        {/* Sidebar - conditionally rendered based on isSidebarOpen */}
        {isSidebarOpen && (
          <div className="w-80 ml-4">
            <SidebarTabs
              onClose={onToggleSidebar}
              workshopId={workshop.id}
              isHost={isHost}
            />
          </div>
        )}
      </div>

        {/* Control Bar - Only render for VIDEO type, as AudioConclaveView has its own controls */}
        {workshop.type === 'VIDEO' && (
          <ControlBar
            workshopId={workshop.id}
            roomName={roomName}
            type={workshop.type}
            onEndLive={onEndLive}
            toggleSidebar={onToggleSidebar}
            isSidebarOpen={isSidebarOpen || false}
          />
        )}
    </>
  )
}

export default function ConclaveRoom({
  token,
  serverUrl,
  workshop,
  userId,
  userRole,
  onEndLive,
  isSidebarOpen,
  onToggleSidebar,
  roomName
}: ConclaveRoomProps & {
  onToggleSidebar: () => void
}) {
  const isHost = workshop.host_id === userId

  return (
    <div className="relative w-full h-full flex flex-col gap-4">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        data-lk-theme="default"
        connect={true}
        className="flex-1 flex flex-col"
      >
        <ConclaveRoomContent
          workshop={workshop}
          isHost={isHost}
          userRole={userRole}
          onEndLive={onEndLive}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
          roomName={roomName}
        />
      </LiveKitRoom>
    </div>
  )
}

