import { useLocalParticipant, RoomAudioRenderer } from '@livekit/components-react';
import { Track, TrackPublication } from 'livekit-client';
import { Mic, MicOff, Hand, LogOut } from 'lucide-react';
import { useMemo } from 'react';

interface ConclaveControlsProps {
  onLeave: () => void;
}

export function ConclaveControls({ onLeave }: ConclaveControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const micPublication = localParticipant?.getTrackPublication(Track.Source.Microphone);
  const isMicEnabled = micPublication?.isEnabled;

  const metadata = useMemo(() => {
    try {
      return JSON.parse(localParticipant?.metadata || '{}');
    } catch {
      return {};
    }
  }, [localParticipant?.metadata]);

  const handRaised = metadata.handRaised;
  const canSpeak = metadata.canSpeak === true; // Get the 'canSpeak' status

  const toggleMic = async () => {
    // Only allow mic toggle if canSpeak permission is granted
    if (localParticipant && canSpeak) {
      await localParticipant.setMicrophoneEnabled(!isMicEnabled);
    } else if (localParticipant && !canSpeak) {
        // Optional: Provide feedback to the user that they don't have permission
        console.warn("You do not have permission to speak.");
        // alert("You need permission from the host to speak.");
    }
  };


  const toggleHandRaise = async () => {
    const newMetadata = { ...metadata, handRaised: !handRaised };
    await localParticipant?.setAttributes({ metadata: JSON.stringify(newMetadata) });
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-md rounded-full px-8 py-4 shadow-xl border border-gray-700 flex items-center gap-6 z-50">
      <button
        onClick={toggleMic}
        // Disable button if canSpeak is false
        disabled={!canSpeak && !isMicEnabled} // Allow muting if already speaking, but not unmuting
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200
          ${isMicEnabled && canSpeak ? 'bg-[#e6b31c] text-white' : 'bg-gray-700 text-gray-300'}
          ${!canSpeak && !isMicEnabled ? 'opacity-50 cursor-not-allowed' : ''}` // Visual cue for disabled
        }
        title={canSpeak ? (isMicEnabled ? 'Mute' : 'Unmute') : 'Permission to speak required'}
      >
        {isMicEnabled && canSpeak ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

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

