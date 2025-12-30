'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParticipants, useLocalParticipant, useRoomContext, useParticipantInfo } from '@livekit/components-react';
import Avatar from '@/app/components/Avatar';
import { createClient } from '@/app/lib/supabaseClient';
import { Mic, MicOff, Video, VideoOff, MoreVertical, XCircle, Slash, Crown, ToggleLeft, ToggleRight, Hand } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRoleManager } from '@/hooks/useRoleManager'; // Import the new hook
import { Participant } from 'livekit-client';

interface ParticipantListProps {
  workshopId: string;
  isHost: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ workshopId, isHost }) => {
  const allParticipants = useParticipants();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [participantProfiles, setParticipantProfiles] = useState<Map<string, { full_name: string; username: string; avatar_url: string; role: string }>>(new Map());
  const localParticipantProfile = participantProfiles.get(localParticipant?.identity || '');
  const isLocalHost = isHost;
  const isLocalAdmin = localParticipantProfile?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Use the useRoleManager for local participant to get management functions
  const {
    promoteToSpeaker,
    demoteToListener,
    muteParticipant,
  } = useRoleManager({ participant: localParticipant as Participant, roomName: room.name });

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


  // handleToggleSpeakPermission is replaced by promoteToSpeaker and demoteToListener from useRoleManager
  // handleMuteVideoToggle is replaced by muteParticipant from useRoleManager

  const handleRemoveParticipant = async (participantIdentity: string) => {
    if (!isLocalHost && !isLocalAdmin) return;

    // This requires server-side API call to remove a participant
    try {
      const response = await fetch('/api/livekit/manage-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: room.name, participantIdentity }),
      });
      if (!response.ok) {
        throw new Error('Failed to remove participant');
      }
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
          
          let canParticipantPublish = false;
          interface ParticipantMetadata { canSpeak?: boolean; handRaised?: boolean; }
          let pMetadata: ParticipantMetadata = {}; // Initialize pMetadata outside the try-catch
          try {
            pMetadata = JSON.parse(participant.metadata || '{}');
            canParticipantPublish = pMetadata.canSpeak === true || participant.permissions?.canPublish === true;
          } catch {
            canParticipantPublish = participant.permissions?.canPublish === true;
          }

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
                  {pMetadata.handRaised && <Hand className="ml-2 h-4 w-4 text-yellow-500 inline-block" />}
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

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
