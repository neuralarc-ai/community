import { useLocalParticipant } from '@livekit/components-react';
import { Participant } from 'livekit-client';
import { MicOff, Hand } from 'lucide-react';
import Avatar from '@/app/components/Avatar';
import { useMemo, useEffect, useState } from 'react';
import { createClient } from '@/app/lib/supabaseClient';

interface ParticipantTileProfile {
  avatar_url: string | null;
  full_name: string | null;
  username: string | null;
}

interface ParticipantTileProps {
  participant: Participant;
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const { localParticipant } = useLocalParticipant();
  const isLocal = participant.identity === localParticipant?.identity;
  const [profile, setProfile] = useState<ParticipantTileProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const handRaised = useMemo(() => {
    try {
      return JSON.parse(participant.metadata || '{}').handRaised;
    } catch {
      return false;
    }
  }, [participant.metadata]);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, username')
        .eq('id', participant.identity)
        .single();
      
      if (error) {
        console.error('Error fetching profile for participant tile:', error);
      } else if (data) {
        setProfile(data as ParticipantTileProfile);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [participant.identity]);

  return (
    <div className="relative flex flex-col items-center gap-2 group">
      <div className="relative">
        <div className={`relative z-10 p-1 rounded-full border-4 transition-all duration-300 ${participant.isSpeaking ? 'border-[#e6b31c] scale-105' : 'border-transparent'}`}>
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.full_name || participant.name || participant.identity}
            size={96}
            className="w-24 h-24 sm:w-28 sm:h-28 grayscale-[0.2] group-hover:grayscale-0 transition-all"
          />
        </div>

        {/* Hand Raised Indicator */}
        {handRaised && (
          <div className="absolute -top-2 -right-2 bg-white text-yellow-500 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-xl border-2 border-white/50 animate-bounce z-20">
            <Hand size={18} />
          </div>
        )}

        {/* Mute Status */}
        {!participant.isMicrophoneEnabled && (
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg border border-black z-20">
            <MicOff size={12} />
          </div>
        )}
      </div>

      <div className="text-center space-y-0.5">
        <span className="text-sm text-gray-300 font-manrope line-clamp-1">
          {profile?.full_name || participant.name || 'Anonymous'} {isLocal && '(You)'}
        </span>
      </div>
    </div>
  );
}

