'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from '@livekit/components-react'
import { RemoteParticipant } from 'livekit-client'
import {
  Mic, MicOff, Video, VideoOff, Hand, MonitorUp, UserPlus, MessageSquare, PhoneOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoleManager } from '@/hooks/useRoleManager';

interface ControlBarProps {
  workshopId: string;
  roomName: string;
  type: 'AUDIO' | 'VIDEO';
  onEndLive: () => Promise<boolean | void>;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function ControlBar({
  workshopId,
  roomName,
  type,
  onEndLive,
  toggleSidebar,
  isSidebarOpen,
}: ControlBarProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const router = useRouter();

  const { isHost, isSpeaker, isListener, promoteToSpeaker } = useRoleManager({
    participant: localParticipant,
    roomName: roomName
  });

  // Parse local metadata for handRaised status
  const metadata = useMemo(() => {
    try {
      return JSON.parse(localParticipant.metadata || '{}');
    } catch {
      return {};
    }
  }, [localParticipant.metadata]);

  const toggleHand = async () => {
    const newMetadata = JSON.stringify({
      ...metadata,
      handRaised: !metadata.handRaised
    });
    await localParticipant.setMetadata(newMetadata);
  };

  const handleLeaveSession = async () => {
    if (!confirm('Are you sure you want to leave this session?')) {
      return;
    }
    if (room) {
      await room.disconnect();
    }
    await onEndLive();
    router.push('/workshops');
    router.refresh();
  };

  const handleShareScreen = async () => {
    // Implement screen sharing logic here
    console.log("Share screen clicked");
    // Example: Toggle screen share
    if (localParticipant.isScreenShareEnabled) {
      await localParticipant.setScreenShareEnabled(false);
    } else {
      await localParticipant.setScreenShareEnabled(true);
    }
  };

  const handleInvite = () => {
    // Implement invite logic here
    console.log("Invite clicked");
    // For now, let's just copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-gray-900/90 backdrop-blur rounded-full shadow-2xl z-50">

      {/* Mic Toggle */}
      <Button
        size="icon"
        variant="ghost"
        className={`rounded-full h-10 w-10 ${!localParticipant.isMicrophoneEnabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-white hover:bg-white/10'}`}
        onClick={() => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)}
      >
        {localParticipant.isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </Button>

      {/* Camera Toggle */}
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

      {/* Raise Hand */}
      <Button
        size="icon"
        variant="ghost"
        className={`rounded-full h-10 w-10 transition-all ${metadata.handRaised ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'text-white hover:bg-white/10'}`}
        onClick={toggleHand}
      >
        <Hand size={20} fill={metadata.handRaised ? "currentColor" : "none"} />
      </Button>

      {/* Share Screen */}
      <Button
        size="icon"
        variant="ghost"
        className={`rounded-full h-10 w-10 ${localParticipant.isScreenShareEnabled ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30' : 'text-white hover:bg-white/10'}`}
        onClick={handleShareScreen}
      >
        <MonitorUp size={20} />
      </Button>

      {/* Invite */}
      <Button
        size="icon"
        variant="ghost"
        className="rounded-full h-10 w-10 text-white hover:bg-white/10"
        onClick={handleInvite}
      >
        <UserPlus size={20} />
      </Button>

      <div className="w-[1px] h-6 bg-white/10 mx-1" />

      {/* Toggle Sidebar */}
      <Button
        size="icon"
        variant="ghost"
        className={`rounded-full h-10 w-10 ${isSidebarOpen ? 'bg-white/10 text-white' : 'text-white hover:bg-white/10'}`}
        onClick={toggleSidebar}
      >
        <MessageSquare size={20} />
      </Button>

      {/* Leave Button (far right) */}
      <Button
        variant="destructive"
        size="icon"
        className="rounded-full h-10 w-10 bg-red-600 hover:bg-red-700 ml-2"
        onClick={handleLeaveSession}
      >
        <PhoneOff size={20} />
      </Button>
    </div>
  );
}

