'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import Avatar from '@/app/components/Avatar';
import { createClient } from '@/app/lib/supabaseClient';
import { User } from '@/app/types';

interface JoineesDisplayProps {
  workshopId: string;
}

export const JoineesDisplay: React.FC<JoineesDisplayProps> = ({ workshopId }) => {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const [participantProfiles, setParticipantProfiles] = useState<Map<string, { full_name: string; username: string; avatar_url: string }>>(new Map());

  const allParticipants = useMemo(() => {
    const participants = remoteParticipants.map(p => p);
    if (localParticipant) {
      participants.unshift(localParticipant);
    }
    return participants;
  }, [localParticipant, remoteParticipants]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const supabase = createClient();
      const identities = new Set<string>();

      allParticipants.forEach(p => identities.add(p.identity));

      if (identities.size === 0) {
        setParticipantProfiles(new Map());
        return;
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', Array.from(identities));

      if (error) {
        console.error('Error fetching participant profiles:', error);
        return;
      }

      const newProfilesMap = new Map<string, { full_name: string; username: string; avatar_url: string }>();
      profiles.forEach(p => {
        newProfilesMap.set(p.id, { full_name: p.full_name, username: p.username, avatar_url: p.avatar_url });
      });
      setParticipantProfiles(newProfilesMap);
    };

    fetchProfiles();
  }, [allParticipants]);

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center bg-black/50 px-3 py-2 rounded-full text-white text-sm shadow-lg">
      <span className="mr-2 font-semibold">Joinees: {allParticipants.length}</span>
      <div className="flex -space-x-2">
        {allParticipants.map(p => {
          const profile = participantProfiles.get(p.identity);
          return (
            <Avatar
              key={p.identity}
              src={profile?.avatar_url}
              alt={profile?.username || 'User'}
              size={28}
              className="border-2 border-white"
            />
          );
        })}
      </div>
    </div>
  );
};

