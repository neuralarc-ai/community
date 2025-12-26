import { useLocalParticipant, RoomAudioRenderer, useRemoteParticipants } from '@livekit/components-react';
import { Track, TrackPublication } from 'livekit-client';
import { Mic, MicOff, Hand, LogOut } from 'lucide-react';
import { useMemo } from 'react';

interface ConclaveControlsProps {
  onLeave: () => void;
}

export function ConclaveControls({ onLeave }: ConclaveControlsProps) {
  const { localParticipant } = useLocalParticipant();
  
  // Use LiveKit permissions to drive UI visibility
  const canPublish = localParticipant?.permissions?.canPublish === true;
  const isMicEnabled = localParticipant?.isMicrophoneEnabled;

  const metadata = useMemo(() => {
    try {
      return JSON.parse(localParticipant?.metadata || '{}');
    } catch {
      return {};
    }
  }, [localParticipant?.metadata]);

  const handRaised = metadata.handRaised;

  const toggleMic = async () => {
    if (localParticipant && canPublish) {
      await localParticipant.setMicrophoneEnabled(!isMicEnabled);
    }
  };


  const toggleHandRaise = async () => {
    const newMetadata = { ...metadata, handRaised: !handRaised };
    await localParticipant?.setAttributes({ metadata: JSON.stringify(newMetadata) });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-md rounded-full px-8 py-4 shadow-xl border border-gray-700 flex items-center gap-6 z-50">
      {canPublish && (
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200
            ${isMicEnabled ? 'bg-[#e6b31c] text-white' : 'bg-gray-700 text-gray-300'}`}
          title={isMicEnabled ? 'Mute' : 'Unmute'}
        >
          {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
      )}

      <button
        onClick={toggleHandRaise}
        className={`relative flex items-center gap-2 px-5 py-2 rounded-full transition-colors duration-200
          ${handRaised ? 'bg-[#e6b31c] text-white' : 'border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'}`}
        title={handRaised ? 'Lower Hand' : 'Raise Hand'}
      >
        <Hand size={18} />
        <span className="font-manrope text-sm">{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
      </button>

      <button
        onClick={onLeave}
        className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
        title="Leave Conclave"
      >
        <LogOut size={24} />
      </button>
      <RoomAudioRenderer />
    </div>
  );
}

