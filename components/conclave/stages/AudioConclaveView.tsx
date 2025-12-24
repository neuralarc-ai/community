import { RoomAudioRenderer } from '@livekit/components-react';
import { AudioGrid } from './AudioGrid';
import { ConclaveControls } from './ConclaveControls';

interface AudioConclaveViewProps {
  onLeave: () => void;
}

export default function AudioConclaveView({ onLeave }: AudioConclaveViewProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl font-manrope">
      <AudioGrid />
      <ConclaveControls onLeave={onLeave} />
      {/* Required for audio playback */}
      <RoomAudioRenderer />
    </div>
  );
}

