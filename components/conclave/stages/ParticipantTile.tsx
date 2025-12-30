import { useLocalParticipant } from '@livekit/components-react';
import { Participant } from 'livekit-client';
import { MicOff, Hand, MoreVertical, VolumeX, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'; // Added MoreVertical, VolumeX, ArrowDownCircle, ArrowUpCircle
import Avatar from '@/app/components/Avatar';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'; // Assuming you have shadcn/ui dropdown
import { useRoleManager } from '@/hooks/useRoleManager'; // Import the new hook
import { useRoomContext } from '@livekit/components-react'; // Import useRoomContext


interface ParticipantTileProps {
  participant: Participant;
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext(); // Get the room context
  const isLocal = participant.identity === localParticipant?.identity;
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
  let avatarSrc = '/images/default-avatar.jpg'; // Default fallback

  if (metadata.avatarUrl) {
    if (metadata.avatarUrl.startsWith('http')) {
      // CASE A: It's already a full Supabase URL -> Use directly
      avatarSrc = metadata.avatarUrl;
    } else {
      // CASE B: It's just a filename -> Use internal API
      avatarSrc = `/api/avatar/${metadata.avatarUrl}`;
    }
  }

  const {
    promoteToSpeaker,
    demoteToListener,
    muteParticipant,
  } = useRoleManager({ participant: participant, roomName: room.name });

  const isLocalHost = metadata.role === 'host' && isLocal;
  const isTargetSpeaker = metadata.role === 'speaker';
  const isTargetListener = metadata.role === 'listener';
  const handRaised = metadata.handRaised || false;

  return (
    <div className="relative flex flex-col items-center gap-2 group">
      <div className="relative">
        <div className={`relative z-10 p-1 rounded-full border-4 transition-all duration-300 ${participant.isSpeaking ? 'border-[#e6b31c] scale-105' : 'border-transparent'}`}>
          <Avatar
            src={avatarSrc}
            alt={metadata?.fullName || metadata?.username || participant.name || participant.identity}
            size={96}
            className="w-24 h-24 sm:w-28 sm:h-28 grayscale-[0.2] group-hover:grayscale-0 transition-all"
          />
          {/* Hand Raised Indicator */}
          {handRaised && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-xl border-2 border-white/50 animate-bounce animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-20" data-state={handRaised ? 'open' : 'closed'}>
              <Hand size={18} />
            </div>
          )}
        </div>

        {/* Mute Status */}
        {!participant.isMicrophoneEnabled && (isTargetSpeaker || isLocalHost) && ( // Only show mute indicator if they are a speaker or local host can see it
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg border border-black z-20">
            <MicOff size={12} />
          </div>
        )}

        {/* Host controls for other participants */}
        {isLocalHost && !isLocal && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity z-30"
              >
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {isTargetListener && (
                <DropdownMenuItem onClick={() => promoteToSpeaker(participant.identity)}>
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  <span>Invite to Speak</span>
                </DropdownMenuItem>
              )}
              {isTargetSpeaker && (
                <>
                  {participant.isMicrophoneEnabled && (
                    <DropdownMenuItem onClick={() => muteParticipant(participant.identity, 'audio', true)}>
                      <VolumeX className="mr-2 h-4 w-4" />
                      <span>Mute User</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => demoteToListener(participant.identity)}>
                    <ArrowDownCircle className="mr-2 h-4 w-4" />
                    <span>Move to Audience</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="text-center space-y-0.5">
        <span className="text-sm text-gray-300 font-manrope line-clamp-1">
          {metadata?.fullName || metadata?.username || participant.name || 'Anonymous'} {isLocal && '(You)'}
        </span>
      </div>
    </div>
  );
}

