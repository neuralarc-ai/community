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
  const [displayAvatarSrc, setDisplayAvatarSrc] = useState('/images/default-avatar.jpg');

  useEffect(() => {
    if (participant.metadata) {
      try {
        const parsedMetadata = JSON.parse(participant.metadata);
        setMetadata(parsedMetadata);
        if (typeof parsedMetadata.handRaised === 'boolean') {
          setIsHandRaised(parsedMetadata.handRaised);
        }

        // Set avatarSrc only once when the component mounts or participant changes
        if (parsedMetadata?.avatarUrl) {
          if (parsedMetadata.avatarUrl.startsWith('http')) {
            setDisplayAvatarSrc(parsedMetadata.avatarUrl);
          } else {
            setDisplayAvatarSrc(`/api/avatar/${parsedMetadata.avatarUrl}`);
          }
        }
      } catch (e) {
        console.error('Failed to parse participant metadata:', e);
        setMetadata(null);
        setDisplayAvatarSrc('/images/default-avatar.jpg');
      }
    } else {
      setMetadata(null);
      setDisplayAvatarSrc('/images/default-avatar.jpg');
    }

    // Set up an interval to poll for changes in handRaised status
    const interval = setInterval(() => {
      if (participant.metadata) {
        try {
          const parsedMetadata = JSON.parse(participant.metadata);
          if (typeof parsedMetadata.handRaised === 'boolean') {
            setIsHandRaised(parsedMetadata.handRaised);
          }
        } catch (e) {
          console.error('Failed to parse participant metadata in interval:', e);
        }
      }
    }, 1000); // Poll for changes every second

    return () => clearInterval(interval);
  }, [participant.identity, participant.metadata]); 

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-full transition-all duration-300",
        "bg-gray-800 border-2 border-transparent",
        isSpeaking && "border-[#e6b31c]",
          isAlone
            ? "w-48 h-48 sm:w-64 sm:h-64" // Larger for single participant
            : "w-24 h-24 sm:w-32 sm:h-32"
      )}
    >
      <div className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        "w-full h-full" // Removed padding to ensure proper centering
      )}>
        {/* Avatar */}
        <Image
          src={displayAvatarSrc}
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

