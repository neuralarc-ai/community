'use client'

import { Participant, Track } from 'livekit-client';
import { useTracks, useParticipantInfo, useIsSpeaking, useLocalParticipant } from '@livekit/components-react';
import { MicOff, Hand } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AudioParticipantTileProps {
  participant: Participant;
  isAlone: boolean;
}

export const AudioParticipantTile = ({ participant, isAlone }: AudioParticipantTileProps) => {
  const { identity, name } = useParticipantInfo({ participant });
  const isSpeaking = useIsSpeaking(participant);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const { localParticipant } = useLocalParticipant();

  const allTracks = useTracks([Track.Source.Microphone]);
  const tracks = allTracks.filter(track => track.participant.identity === participant.identity);

  const isMuted = tracks.length === 0 || tracks[0]?.publication?.isMuted;
  const isLocal = participant.identity === localParticipant.identity;

  const [metadata, setMetadata] = useState<any | null>(null);

  useEffect(() => {
    const updateMetadata = () => {
      if (participant.metadata) {
        try {
          const parsedMetadata = JSON.parse(participant.metadata);
          setMetadata(parsedMetadata);
          if (typeof parsedMetadata.handRaised === 'boolean') {
            setIsHandRaised(parsedMetadata.handRaised);
          }
        } catch (e) {
          console.error('Failed to parse participant metadata:', e);
          setMetadata(null);
        }
      } else {
        setMetadata(null);
      }
    };

    updateMetadata(); // Initial check
    const interval = setInterval(updateMetadata, 1000); // Poll for changes

    return () => clearInterval(interval);
  }, [participant.metadata]);

  let avatarSrc = '/images/default-avatar.jpg'; // Default fallback

  if (metadata?.avatarUrl) {
    if (metadata.avatarUrl.startsWith('http')) {
      // CASE A: It's already a full Supabase URL -> Use directly
      avatarSrc = metadata.avatarUrl;
    } else {
      // CASE B: It's just a filename -> Use internal API
      avatarSrc = `/api/avatar/${metadata.avatarUrl}`;
    }
  } 

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full transition-all duration-300",
        "bg-gray-800 border-2 border-transparent",
        isSpeaking && "border-[#e6b31c] shadow-lg shadow-[#e6b31c]/30",
        isAlone
          ? "w-48 h-48 sm:w-64 sm:h-64 animate-pulse-slight" // Larger for single participant, with pulsing effect
          : "w-24 h-24 sm:w-32 sm:h-32"
      )}
    >
      <div className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        "w-full h-full" // Removed padding to ensure proper centering
      )}>
        {/* Avatar */}
        <Image
          src={avatarSrc}
          alt={name || identity || 'Participant'}
          width={isAlone ? 200 : 100}
          height={isAlone ? 200 : 100}
          className="rounded-full object-cover w-full h-full"
          onError={(e) => { e.currentTarget.src = '/images/default-avatar.jpg'; }}
        />

        {/* Muted Indicator */}
        {isMuted && (
          <div className="absolute bottom-0 right-0 p-1 bg-red-600 rounded-full text-white">
            <MicOff size={16} />
          </div>
        )}

        {/* Hand Raised Indicator */}
        {isHandRaised && (
          <div className="absolute top-0 left-0 p-1 bg-blue-600 rounded-full text-white">
            <Hand size={16} />
          </div>
        )}
      </div>

      {/* Name */}
      <div
        className={cn(
          "absolute bottom-0 mb-[-25px] text-white text-sm font-semibold truncate",
          isAlone ? "text-lg mb-[-30px]" : "text-sm mb-[-25px]"
        )}
      >
        {isLocal ? `${metadata?.fullName || metadata?.username || name || identity} (You)` : metadata?.fullName || metadata?.username || name || identity}
      </div>
    </div>
  );
};

