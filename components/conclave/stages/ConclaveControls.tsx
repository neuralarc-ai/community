import { useLocalParticipant, RoomAudioRenderer, useRemoteParticipants } from '@livekit/components-react';
import { Track, TrackPublication } from 'livekit-client';
import { Mic, MicOff, Hand, LogOut, CheckCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import ClickSpark from '@/components/ClickSpark';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConclaveControlsProps {
  onLeave: () => void;
  userRole: string | null;
}

export function ConclaveControls({ onLeave, userRole }: ConclaveControlsProps) {
  const { localParticipant } = useLocalParticipant();
  
  const metadata = useMemo(() => {
    try {
      return JSON.parse(localParticipant?.metadata || '{}');
    } catch {
      return {};
    }
  }, [localParticipant?.metadata]);

  // Use the explicitly passed userRole as the primary source of truth
  // Fall back to metadata or LiveKit permissions for secondary checks
  const isAdmin = userRole === 'admin';
  const isHost = userRole === 'host' || metadata.role === 'host';
  
  const canPublish = isAdmin || isHost || metadata.canSpeak === true || localParticipant?.permissions?.canPublish === true;
  const isMicEnabled = localParticipant?.isMicrophoneEnabled;

  const toggleMic = async () => {
    if (localParticipant && canPublish) {
      await localParticipant.setMicrophoneEnabled(!isMicEnabled);
    }
  };


  const [isHandRaisedLocal, setIsHandRaisedLocal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setIsHandRaisedLocal(metadata.handRaised || false);
  }, [metadata.handRaised]);

  const toggleHandRaise = async () => {
    if (localParticipant) {
      const newHandRaisedStatus = !isHandRaisedLocal;
      setIsHandRaisedLocal(newHandRaisedStatus);
      const newMetadata = { ...metadata, handRaised: newHandRaisedStatus };
      await localParticipant.setMetadata(JSON.stringify(newMetadata));
    }
  };

  const handRaised = isHandRaisedLocal;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-md rounded-full px-8 py-4 shadow-xl border border-gray-700 flex items-center gap-6 z-50">
      {canPublish && (
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0
            ${isMicEnabled ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          title={isMicEnabled ? 'Mute' : 'Unmute'}
        >
          {isMicEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
      )}

      <ClickSpark>
        <button
          onClick={toggleHandRaise}
          className={`relative flex items-center gap-2 px-5 py-2 rounded-full transition-colors duration-200
            ${handRaised ? 'bg-[#e6b31c] text-white' : 'border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'}`}
          title={handRaised ? 'Lower Hand' : 'Raise Hand'}
          aria-label={handRaised ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand className="w-8 h-8" />
          <span className="font-manrope text-sm">Raise Hand</span>
        </button>
      </ClickSpark>

      <button
        onClick={onLeave}
        className="bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 flex-shrink-0"
        title="Leave Conclave"
      >
        <LogOut className="w-8 h-8 text-white" stroke="currentColor" />
      </button>
      <RoomAudioRenderer />
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-[#27584F]/10 border border-[#27584F] text-white p-6 rounded-2xl shadow-xl backdrop-blur-xl">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-[#27584F]" />
            <DialogTitle className="text-2xl font-bold text-white">Email was successfully sent!</DialogTitle>
            <DialogDescription className="text-zinc-400 text-base">
              Your conclave invitation emails have been successfully dispatched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" className="w-full bg-[#27584F] hover:bg-[#27584F]/90 text-white font-bold py-3 rounded-xl transition-colors duration-200">
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

