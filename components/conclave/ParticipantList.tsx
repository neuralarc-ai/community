'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useParticipants, useLocalParticipant, useRoomContext, useParticipantInfo } from '@livekit/components-react';
import Avatar from '@/app/components/Avatar';
import { createClient } from '@/app/lib/supabaseClient';
import { Mic, MicOff, Video, VideoOff, MoreVertical, XCircle, Slash, Crown, ToggleLeft, ToggleRight, Hand, VideoIcon, Pin } from 'lucide-react';
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
import { useSpotlight } from '@/app/hooks/useSpotlight';

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
  const [isUpdatingSpotlight, setIsUpdatingSpotlight] = useState(false);

  // Use the spotlight hook to get current spotlight state and toggle function
  const { currentSpotlightId, setSpotlight } = useSpotlight(workshopId);

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

  const handleToggleSpotlight = async (participantId: string) => {
    if (isUpdatingSpotlight) return;
    
    setIsUpdatingSpotlight(true);
    try {
      // If clicking the same user, unpin; otherwise, pin the new user
      await setSpotlight(currentSpotlightId === participantId ? null : participantId);
    } catch (error) {
      console.error('Error updating spotlight:', error);
    } finally {
      setIsUpdatingSpotlight(false);
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
          const isSpotlighted = currentSpotlightId === participant.identity;
          
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
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.username || 'User'}
                  size={36}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-medium text-white truncate">
                    {profile?.full_name || profile?.username || 'Anonymous'}
                    {participant.isLocal && ' (me)'}
                  </span>
                  {pMetadata.handRaised && <Hand className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                  {isParticipantHost && <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
                  {isParticipantAdmin && (
                    <span className="px-2 py-0.5 bg-admin-yellow/20 text-admin-yellow rounded-full text-[10px] font-bold uppercase tracking-wider border border-admin-yellow/30 flex-shrink-0">
                      Admin
                    </span>
                  )}
                  {/* Spotlight Badge */}
                  {isSpotlighted && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/30 flex-shrink-0">
                      <VideoIcon className="h-3 w-3" />
                      LIVE
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Audio Status */}
                {participant.isMicrophoneEnabled ? (
                  <Mic className="h-4 w-4 text-green-500" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-500" />
                )}

                {/* Admin/Host Controls - More Options Menu */}
                {(isLocalHost || isLocalAdmin) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                      <DropdownMenuItem
                        onClick={() => handleToggleSpotlight(participant.identity)}
                        disabled={isUpdatingSpotlight}
                        className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700"
                      >
                        <Pin className="h-4 w-4 mr-2" />
                        {isSpotlighted ? 'Remove from Stage' : 'Spotlight for Everyone'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveParticipant(participant.identity)}
                        className="cursor-pointer hover:bg-red-600/20 focus:bg-red-600/20 text-red-400"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove Participant
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
