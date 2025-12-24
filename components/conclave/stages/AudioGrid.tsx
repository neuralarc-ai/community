import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ParticipantTile } from './ParticipantTile';

export function AudioGrid() {
  const trackRefs = useTracks([Track.Source.Microphone]);

  return (
    <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-start justify-items-center w-full max-w-7xl">
        {trackRefs.map((trackRef) => (
          <ParticipantTile key={trackRef.participant.identity} participant={trackRef.participant} />
        ))}
      </div>
    </div>
  );
}

