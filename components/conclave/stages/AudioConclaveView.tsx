import { RoomAudioRenderer } from '@livekit/components-react';
import { AudioGrid } from './AudioGrid';
import { ConclaveControls } from './ConclaveControls';

interface AudioConclaveViewProps {
  onLeave: () => void;
  userRole: string | null;
}

export default function AudioConclaveView({ onLeave, userRole }: AudioConclaveViewProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden border border-white/5 shadow-2xl font-manrope">
      <AudioGrid />
      <ConclaveControls onLeave={onLeave} userRole={userRole} />
      {/* Required for audio playback */}
      <RoomAudioRenderer />
    </div>
  );
}

