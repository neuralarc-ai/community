'use client'

import { 
  useTracks,
  RoomAudioRenderer,
  BarVisualizer,
  ParticipantContext,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { MicOff, ShieldCheck } from 'lucide-react'
import Avatar from '@/app/components/Avatar'
import { useMemo, useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabaseClient';
import { Profile } from '@/app/types';

interface AudioStageProfile {
  avatar_url: string | null;
  full_name: string | null;
  username: string | null;
}

export default function AudioStage() {
  // Use useTracks to get only active audio tracks
  const trackRefs = useTracks([Track.Source.Microphone])

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start justify-items-center">
          {trackRefs.map((trackRef) => (
            <SpaceAvatar key={trackRef.participant.identity} trackRef={trackRef} />
          ))}
        </div>
      </div>
      
      {/* Required for audio playback */}
      <RoomAudioRenderer />
    </div>
  )
}

function SpaceAvatar({ trackRef }: { trackRef: any }) {
  const p = trackRef.participant;
  const [profile, setProfile] = useState<AudioStageProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, username')
        .eq('id', p.identity)
        .single();
      
      if (error) {
        console.error('Error fetching profile for audio stage:', error);
      } else if (data) {
        setProfile(data as AudioStageProfile);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [p.identity]);
  
  return (
    <div className="relative flex flex-col items-center gap-3 group">
      <div className="relative">
        {/* Speaking indicator ring */}
        <div className={`absolute -inset-2 rounded-full blur-md transition-opacity duration-300 ${p.isSpeaking ? 'bg-green-500/30 opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative z-10 p-1 rounded-full border-2 transition-all duration-300 ${p.isSpeaking ? 'border-green-500 scale-105' : 'border-white/10'}`}>
          <Avatar
            src={profile?.avatar_url} // Use fetched avatar URL
            alt={profile?.full_name || p.name || p.identity}
            size={80}
            className="w-20 h-20 sm:w-24 sm:h-24 grayscale-[0.2] group-hover:grayscale-0 transition-all"
          />
        </div>

        {/* Hand Raised Indicator */}
        <HandRaisedBadge participant={p} />

        {/* Status Badges */}
        <div className="absolute -bottom-1 -right-1 flex gap-1">
          {!p.isMicrophoneEnabled && (
            <div className="bg-red-500 text-white p-1 rounded-full shadow-lg border border-black">
              <MicOff size={12} />
            </div>
          )}
          <HostBadge participant={p} />
        </div>
      </div>

      <div className="text-center space-y-0.5 w-full">
        <span className="text-sm font-semibold text-white line-clamp-1">
          {profile?.full_name || p.name || 'Anonymous'}
        </span>
        <div className="flex justify-center h-4"></div>
      </div>
    </div>
  )
}

function HandRaisedBadge({ participant }: { participant: any }) {
  const metadata = useMemo(() => {
    try {
      return JSON.parse(participant.metadata || '{}')
    } catch {
      return {}
    }
  }, [participant.metadata])

  if (!metadata.handRaised) return null

  return (
    <div className="absolute -top-2 -right-2 bg-white text-yellow-500 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-xl border-2 border-white/50 animate-bounce z-20">
      ✋
    </div>
  )
}

function HostBadge({ participant }: { participant: any }) {
  const metadata = useMemo(() => {
    try {
      return JSON.parse(participant.metadata || '{}')
    } catch {
      return {}
    }
  }, [participant.metadata])

  if (metadata.role !== 'host') return null

  return (
    <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg border border-black" title="Host">
      <ShieldCheck size={12} />
    </div>
  )
}

