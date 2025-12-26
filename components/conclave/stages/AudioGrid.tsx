import { useTracks, useParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { AudioParticipantTile } from './AudioParticipantTile';
import { cn } from '@/lib/utils';

export function AudioGrid() {
  const allParticipants = useParticipants();
  const isAlone = allParticipants.length === 1;

  // Filter out participants who are not publishing audio or are muted
  // For audio conclave, we want to show all participants, regardless of their audio status
  // The AudioParticipantTile will handle the muted indicator
  const participantsToShow = allParticipants; // Show all participants

  return (
    <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
      <div
        className={cn(
          "w-full max-w-7xl",
          isAlone
            ? "flex justify-center items-center h-full"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-center justify-items-center"
        )}
      >
        {participantsToShow.map((participant) => (
          <AudioParticipantTile
            key={participant.identity}
            participant={participant}
            isAlone={isAlone}
          />
        ))}
      </div>
    </div>
  );
}

