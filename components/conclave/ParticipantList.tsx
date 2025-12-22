'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParticipants, useLocalParticipant, useRoomContext, useParticipantInfo } from '@livekit/components-react';
import Avatar from '@/app/components/Avatar';
import { createClient } from '@/app/lib/supabaseClient';
import { Mic, MicOff, Video, VideoOff, MoreVertical, XCircle, Slash, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ParticipantListProps {
  workshopId: string;
  isHost: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ workshopId, isHost }) => {
  const allParticipants = useParticipants();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [participantProfiles, setParticipantProfiles] = useState<Map<string, { full_name: string; username: string; avatar_url: string; role: string }>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);

  const sortedParticipants = useMemo(() => {
    const roomMetadata = room.metadata ? JSON.parse(room.metadata) : {};
    const participants = [...allParticipants].sort((a, b) => {
      // Prioritize host
      const aIsHost = a.identity === roomMetadata.host_identity;
      const bIsHost = b.identity === roomMetadata.host_identity;
      if (aIsHost && !bIsHost) return -1;
      if (!aIsHost && bIsHost) return 1;

      // Prioritize local participant
      if (a.isLocal) return -1;
      if (b.isLocal) return 1;

      // Alphabetical by name
      const aName = participantProfiles.get(a.identity)?.full_name || a.identity;
      const bName = participantProfiles.get(b.identity)?.full_name || b.identity;
      return aName.localeCompare(bName);
    });

    return participants.filter(p => {
      const profile = participantProfiles.get(p.identity);
      const name = profile?.full_name || profile?.username || p.identity;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allParticipants, participantProfiles, searchTerm, room.metadata]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const supabase = createClient();
      const identities = new Set<string>(allParticipants.map(p => p.identity));

      if (identities.size === 0) {
        setParticipantProfiles(new Map());
        return;
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, role')
        .in('id', Array.from(identities));

      if (error) {
        console.error('Error fetching participant profiles:', error);
        return;
      }

      const newProfilesMap = new Map<string, { full_name: string; username: string; avatar_url: string; role: string }>();
      profiles.forEach(p => {
        newProfilesMap.set(p.id, { full_name: p.full_name, username: p.username, avatar_url: p.avatar_url, role: p.role });
      });
      setParticipantProfiles(newProfilesMap);
    };

    fetchProfiles();
  }, [allParticipants]);

  const handleMuteToggle = async (participantIdentity: string, trackType: 'audio' | 'video') => {
    if (!isHost) return;
    
    // This requires server-side API call as client cannot directly mute other participants
    // You would call an API route that uses LiveKit Server SDK to mute the participant
    console.log(`Attempting to toggle ${trackType} for ${participantIdentity}`);
    try {
      const response = await fetch('/api/livekit/mute-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: room.name, participantIdentity, trackType }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle mute');
      }
      console.log(`Successfully toggled ${trackType} for ${participantIdentity}`);
    } catch (error) {
      console.error(`Error toggling ${trackType} for ${participantIdentity}:`, error);
    }
  };

  const handleRemoveParticipant = async (participantIdentity: string) => {
    if (!isHost) return;

    // This requires server-side API call to remove a participant
    console.log(`Attempting to remove ${participantIdentity}`);
    try {
      const response = await fetch('/api/livekit/remove-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: room.name, participantIdentity }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove participant');
      }
      console.log(`Successfully removed ${participantIdentity}`);
    } catch (error) {
      console.error(`Error removing ${participantIdentity}:`, error);
    }
  };

  const handleRaiseHandToggle = async () => {
    if (!localParticipant) return; // Only local participant can raise their own hand

    const newHandRaisedStatus = !isHandRaised;
    setIsHandRaised(newHandRaisedStatus);

    try {
      const response = await fetch('/api/livekit/toggle-hand-raise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: room.name, participantIdentity: localParticipant.identity, isHandRaised: newHandRaisedStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle hand raise');
      }
      console.log(`Successfully toggled hand raise to ${newHandRaisedStatus}`);
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      // Revert optimistic update on error
      setIsHandRaised(!newHandRaisedStatus);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-4">
        <h2 className="text-xl font-semibold">Participants ({allParticipants.length})</h2>
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search participants..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {sortedParticipants.map(participant => {
          const profile = participantProfiles.get(participant.identity);
          const isParticipantHost = profile?.role === 'host';
          const isParticipantAdmin = profile?.role === 'admin';

          return (
            <div key={participant.identity} className="flex items-center justify-between bg-zinc-900 p-2 rounded-md hover:bg-zinc-800 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.username || 'User'}
                  size={36}
                />
                <span className="font-medium text-white">
                  {profile?.full_name || profile?.username || 'Anonymous'}
                  {participant.isLocal && ' (me)'}
                  {isParticipantHost && <Crown className="ml-1 h-4 w-4 inline-block text-yellow-400" />}
                  {isParticipantAdmin && <span className="ml-2 px-2 py-0.5 bg-admin-yellow/20 text-admin-yellow rounded-full text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/30">Admin</span>}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Audio Status */}
                {participant.isMicrophoneEnabled ? (
                  <Mic className="h-4 w-4 text-green-500" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-500" />
                )}

                {/* Video Status */}
                {participant.isCameraEnabled ? (
                  <Video className="h-4 w-4 text-green-500" />
                ) : (
                  <VideoOff className="h-4 w-4 text-red-500" />
                )}

                {isHost && !participant.isLocal && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border border-zinc-700 text-white">
                      <DropdownMenuItem onClick={() => handleMuteToggle(participant.identity, 'audio')}>
                        {participant.isMicrophoneEnabled ? 'Mute Audio' : 'Unmute Audio'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMuteToggle(participant.identity, 'video')}>
                        {participant.isCameraEnabled ? 'Mute Video' : 'Unmute Video'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRemoveParticipant(participant.identity)} className="text-red-500">
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="border-t border-zinc-700 pt-4 mt-4 flex justify-between gap-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            Invite
          </Button>
          {localParticipant?.isMicrophoneEnabled ? (
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleMuteToggle(localParticipant.identity, 'audio')}>
              Mute My Audio
            </Button>
          ) : (
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMuteToggle(localParticipant.identity, 'audio')}>
              Unmute My Audio
            </Button>
          )}
          <Button className="flex-1 bg-admin-yellow hover:bg-admin-yellow/90 text-white" onClick={handleRaiseHandToggle}>
            {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
          </Button>
        </div>
      )}
    </div>
  );
};
