import { useLocalParticipant, useParticipants, useRoomContext } from '@livekit/components-react';
import { RemoteParticipant, LocalParticipant, Participant, Track } from 'livekit-client';
import { useMemo } from 'react';

interface UseRoleManagerProps {
  participant: Participant;
  roomName: string;
}

export function useRoleManager({ participant, roomName }: UseRoleManagerProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const isLocal = participant.identity === localParticipant?.identity;

  // Determine roles based on permissions and metadata
  const isSpeaker = useMemo(() => {
    return participant.permissions?.canPublish === true;
  }, [participant.permissions]);

  const isListener = useMemo(() => {
    return participant.permissions?.canPublish === false;
  }, [participant.permissions]);

  const isHost = useMemo(() => {
    // Check if the participant is the host based on metadata (if available)
    // and also has publish permissions.
    try {
      const metadata = JSON.parse(participant.metadata || '{}');
      return metadata.isHost === true && participant.permissions?.canPublish === true;
    } catch {
      return false;
    }
  }, [participant.metadata, participant.permissions]);

  const promoteToSpeaker = async (identity: string) => {
    if (!localParticipant || !localParticipant.identity) {
      console.error("Local participant not available for role management.");
      return;
    }
    try {
      await fetch('/api/livekit/manage-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, identity, action: 'invite_to_stage', hostIdentity: localParticipant.identity }),
      });
    } catch (error) {
      console.error('Failed to promote participant to speaker:', error);
    }
  };

  const demoteToListener = async (identity: string) => {
    if (!localParticipant || !localParticipant.identity) {
      console.error("Local participant not available for role management.");
      return;
    }
    try {
      await fetch('/api/livekit/manage-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, identity, action: 'remove_from_stage', hostIdentity: localParticipant.identity }),
      });
    } catch (error) {
      console.error('Failed to demote participant to listener:', error);
    }
  };

  const muteParticipant = async (participantIdentity: string, trackType: 'audio' | 'video', muted: boolean) => {
    if (!localParticipant || !localParticipant.identity) {
      console.error("Local participant not available for role management.");
      return;
    }
    try {
      // Find the track SID for the given participantIdentity and trackType
      const targetParticipant = room.getParticipantByIdentity(participantIdentity);
      let trackSid: string | undefined;

      if (trackType === 'audio') {
        trackSid = targetParticipant?.getTrackPublication(Track.Source.Microphone)?.trackSid;
      } else if (trackType === 'video') {
        trackSid = targetParticipant?.getTrackPublication(Track.Source.Camera)?.trackSid;
      }

      if (!trackSid) {
        console.error(`Track SID not found for ${participantIdentity}'s ${trackType} track.`);
        return;
      }

      await fetch('/api/livekit/mute-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantIdentity, trackSid, muted }),
      });
    } catch (error) {
      console.error(`Failed to ${muted ? 'mute' : 'unmute'} participant ${trackType} track:`, error);
    }
  };

  return {
    isHost,
    isSpeaker,
    isListener,
    promoteToSpeaker,
    demoteToListener,
    muteParticipant,
    isLocal,
  };
}

