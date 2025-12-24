import React, { useState, FormEvent, useRef, useEffect } from 'react';
import './ConclaveChat.css';
import { useChat, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { useRoomContext } from '@livekit/components-react';
import { createClient } from '@/app/lib/supabaseClient'; // Assuming you have a supabaseClient.ts for client-side
import Avatar from '@/app/components/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Adjust path based on your UI library

interface ConclaveChatProps {
  workshopId: string;
  isHost: boolean;
}

export const ConclaveChat: React.FC<ConclaveChatProps> = ({ workshopId, isHost }) => {
  const { send, chatMessages } = useChat();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const remoteParticipants = useRemoteParticipants();

  const [participantProfiles, setParticipantProfiles] = useState<Map<string, { full_name: string; username: string; avatar_url: string }>>(new Map());

  // Fetch participant profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const supabase = createClient();
      const identities = new Set<string>();

      if (localParticipant) {
        identities.add(localParticipant.identity);
      }
      remoteParticipants.forEach(p => identities.add(p.identity));

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
  }, [localParticipant, remoteParticipants, room?.name]);

  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;

    // 1. Send via LiveKit for instant delivery
    await send(message);

    // 2. Save to Supabase for VOD
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for chat persistence');
        return;
      }

      const { error } = await supabase.from('conclave_chat_messages').insert({
        workshop_id: workshopId,
        user_id: user.id,
                user_name: participantProfiles.get(localParticipant?.identity || '')?.full_name || participantProfiles.get(localParticipant?.identity || '')?.username || 'Anonymous', // Use fetched profile name
        message: message,
      });

      if (error) {
        console.error('Error saving chat message to Supabase:', error);
      }
    } catch (error) {
      console.error('Supabase chat persistence error:', error);
    }

    setMessage('');
  };

  const handleModerationAction = async (identity: string, action: 'mute_chat' | 'unmute_chat' | 'hide_message', messageId?: string) => {
    if (!isHost) return;

    if (action === 'hide_message' && messageId) {
      // Update Supabase and send metadata update for local removal
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('conclave_chat_messages')
          .update({ is_hidden: true })
          .eq('id', messageId);

        if (error) {
          console.error('Error hiding message in Supabase:', error);
          return;
        }

        // TODO: Implement sending a LiveKit metadata update to inform other clients to hide this message.
        // For now, this will only hide it for new loads/VOD. A full implementation would involve LiveKit data channels
        // to broadcast this change in real-time to active participants.
        console.log(`Message ${messageId} hidden.`);
      } catch (error) {
        console.error('Supabase hide message error:', error);
      }
    } else if (action === 'mute_chat' || action === 'unmute_chat') {
      try {
        const response = await fetch('/api/livekit/chat-moderation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomName: room?.name, identity, action, workshopId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Moderation API error:', errorData.error);
        } else {
          console.log(`User ${identity} ${action === 'mute_chat' ? 'muted' : 'unmuted'} from chat.`);
          // LiveKit will automatically update localParticipant.permissions for the muted user.
        }
      } catch (error) {
        console.error('Error calling moderation API:', error);
      }
    }
  };

  const canPublishData = localParticipant?.permissions?.canPublishData ?? true;

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-hidden bg-zinc-950 text-white rounded-lg">
      <div className="p-4 border-b border-zinc-700">
        <h2 className="text-lg font-semibold">Live Chat</h2>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto min-h-0 flex flex-col p-4 space-y-2 custom-scrollbar">
        {chatMessages.map((msg, index) => (
          <div key={index} className="flex items-start space-x-2">
            <Avatar
              src={participantProfiles.get(msg.from?.identity || '')?.avatar_url}
              alt={participantProfiles.get(msg.from?.identity || '')?.full_name || participantProfiles.get(msg.from?.identity || '')?.username || 'User'}
              size={28}
            />
            <div className="flex-1">
              <span className="font-bold mr-2">{participantProfiles.get(msg.from?.identity || '')?.full_name || participantProfiles.get(msg.from?.identity || '')?.username || 'Anonymous'}:</span>
              <span>{msg.message}</span>
            </div>
            {isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="ml-2 p-1 hover:bg-gray-700 rounded-full">
                      ...
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleModerationAction(msg.from?.identity!, 'mute_chat')}>
                    Timeout User
                  </DropdownMenuItem>
                  {/* Assuming messageId can be derived or passed. For LiveKit chat messages, there isn't a direct message ID.
                      This would require storing messages in Supabase first and using the returned ID for this action,
                      or adding custom metadata to LiveKit messages with a Supabase ID.
                      For now, `hide_message` is placeholder, needs further integration if you want real-time hide. */}
                  {/* <DropdownMenuItem onClick={() => handleModerationAction(msg.messageId, 'hide_message')}>
                    Hide Message
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-700 flex-none">
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={canPublishData ? "Say something..." : "You have been muted by a moderator."}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-l-md p-2 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            disabled={!canPublishData}
          />
          <button
            type="submit"
            className={`bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 ${!canPublishData ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canPublishData}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

