import React, { useState, FormEvent, useRef, useEffect } from 'react';
import './ConclaveChat.css';
import { useChat, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { useRoomContext } from '@livekit/components-react';
import { createClient } from '@/app/lib/supabaseClient'; // Assuming you have a supabaseClient.ts for client-side
import Avatar from '@/app/components/Avatar';
import { useToast } from '@/app/components/ui/use-toast'; // For error toasts
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Adjust path based on your UI library

interface ChatMessage {
    id: string;
    workshop_id: string;
    user_id: string;
    user_name: string;
    message: string;
    created_at: string;
    is_hidden?: boolean;
    is_pending?: boolean; // For optimistic updates
}

interface ConclaveChatProps {
  workshopId: string;
  isHost: boolean;
}

export const ConclaveChat: React.FC<ConclaveChatProps> = ({ workshopId, isHost }) => {
  const { toast } = useToast();
  const { send } = useChat(); // Removed chatMessages from here
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const remoteParticipants = useRemoteParticipants();

  const [participantProfiles, setParticipantProfiles] = useState<Map<string, { full_name: string; username: string; avatar_url: string }>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]); // New state for persisted and real-time messages
  const [messageInput, setMessageInput] = useState(''); // Renamed to avoid conflict with 'message' in ChatMessage

  // Refactored participant profile fetching for quicker updates and caching
  useEffect(() => {
    const supabase = createClient();

    const fetchAndCacheProfile = async (identity: string) => {
      if (!identity) {
        console.warn('Attempted to fetch profile with an empty identity. Skipping.');
        return;
      }
      if (participantProfiles.has(identity)) {
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', identity)
        .single();

      if (error) {
        console.error('Error fetching participant profile:', error.message || error);
        return;
      }

      if (profile) {
        setParticipantProfiles(prev => {
          const newMap = new Map(prev);
          newMap.set(profile.id, { full_name: profile.full_name, username: profile.username, avatar_url: profile.avatar_url });
          return newMap;
        });
      }
    };

    // Fetch profiles for existing local and remote participants
    if (localParticipant) {
      fetchAndCacheProfile(localParticipant.identity);
    }
    remoteParticipants.forEach(p => fetchAndCacheProfile(p.identity));

    // Listen for new participants joining the room
    const handleParticipantConnected = (participant: any) => {
      console.log('LiveKit: Participant connected:', participant.identity);
      fetchAndCacheProfile(participant.identity);
    };

    room?.on('participantConnected', handleParticipantConnected);

    return () => {
      room?.off('participantConnected', handleParticipantConnected);
    };
  }, [localParticipant, remoteParticipants, room, participantProfiles]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const supabase = createClient();

    const fetchInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('conclave_chat_messages')
          .select('*')
          .eq('workshop_id', workshopId)
          .eq('is_hidden', false) // Only fetch non-hidden messages
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching initial chat messages:', error);
          // Don't show toast for initial load failure - it's not critical
          // Messages will still work via LiveKit
          return;
        }

        if (data) {
          setMessages(data.reverse() as ChatMessage[]);
          setTimeout(scrollToBottom, 0);
        }
      } catch (err) {
        console.error('Exception fetching initial messages:', err);
        // Continue without showing error - LiveKit messages will still work
      }
    };

    fetchInitialMessages();

    const channelName = `conclave_chat:${workshopId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conclave_chat_messages',
        filter: `workshop_id=eq.${workshopId}`
      }, payload => {
        try {
          console.log('Supabase Realtime: Received new message payload:', payload);
          const newMessage = payload.new as ChatMessage;
          
          // Skip hidden messages
          if (newMessage.is_hidden) {
            return;
          }

          setMessages(prevMessages => {
            // Prevent duplicates if we optimistically added it
            const exists = prevMessages.some(msg => 
              msg.id === newMessage.id || 
              (msg.is_pending && msg.message === newMessage.message && msg.user_id === newMessage.user_id)
            );
            
            if (!exists) {
              const updatedMessages = [...prevMessages, newMessage];
              console.log('Supabase Realtime: Added new message');
              return updatedMessages;
            }
            
            // If it's an optimistic message, replace it with the actual one from Supabase
            const updatedMessages = prevMessages.map(msg => 
              msg.is_pending && msg.message === newMessage.message && msg.user_id === newMessage.user_id 
                ? { ...newMessage, is_pending: false } 
                : msg
            );
            console.log('Supabase Realtime: Replaced optimistic message');
            return updatedMessages;
          });
        } catch (err) {
          console.error('Error processing realtime message:', err);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to chat channel: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to chat channel: ${channelName}`);
        }
      });

    return () => {
      console.log(`Cleaning up chat subscription: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [workshopId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() === '') return;
    if (!localParticipant?.identity) {
      console.error('Local participant identity not available');
      toast({
        variant: "destructive",
        description: "Unable to send message. Please refresh the page.",
      });
      return;
    }

    const messageContent = messageInput.trim();
    const userId = localParticipant.identity;
    const userName = participantProfiles.get(userId)?.full_name || participantProfiles.get(userId)?.username || 'Anonymous';

    // Optimistic Update
    const tempMessage: ChatMessage = {
        id: 'temp-' + Date.now(),
        workshop_id: workshopId,
        user_id: userId,
        user_name: userName,
        message: messageContent,
        created_at: new Date().toISOString(),
        is_pending: true,
    };

    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setMessageInput(''); // Clear input field immediately

    try {
        // 1. Send via LiveKit for instant delivery
        await send(messageContent);

        // 2. Save to Supabase for persistence (non-blocking - if it fails, message still sent via LiveKit)
        try {
          const supabase = createClient();
          
          // Try to get user, but don't fail if auth check fails
          let authUserId = userId;
          try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (!authError && user) {
              authUserId = user.id;
            } else {
              // If auth fails, use participant identity (which should be the user ID)
              console.warn('Auth check failed, using participant identity:', authError?.message);
            }
          } catch (authErr) {
            // Auth check failed, but continue with participant identity
            console.warn('Auth check exception, using participant identity:', authErr);
          }

          const { data, error } = await supabase.from('conclave_chat_messages').insert({
              workshop_id: workshopId,
              user_id: authUserId,
              user_name: userName,
              message: messageContent,
          }).select();

          if (error) {
            // Log error but don't fail the entire operation
            console.error('Error persisting message to Supabase:', error);
            // Mark message as sent (remove pending flag) even if persistence failed
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, is_pending: false }
                        : msg
                )
            );
          } else if (data && data[0]) {
            // Replace the temporary message with the actual one from Supabase
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...data[0] as ChatMessage, is_pending: false }
                        : msg
                )
            );
          }
        } catch (persistError) {
          // Persistence failed, but message was sent via LiveKit
          console.error('Error persisting message (non-critical):', persistError);
          // Mark message as sent (remove pending flag)
          setMessages(prevMessages =>
              prevMessages.map(msg =>
                  msg.id === tempMessage.id
                      ? { ...msg, is_pending: false }
                      : msg
              )
          );
        }
    } catch (error) {
        console.error('Error sending message via LiveKit:', error);
        toast({
          variant: "destructive",
          description: "Failed to send message. Please try again.",
        });
        // Remove the temporary message on failure
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
    }
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
        {messages.map((msg, index) => (
          !msg.is_hidden && ( // Only display messages that are not hidden
            <div key={msg.id} className="flex items-start space-x-2">
              <Avatar
                src={participantProfiles.get(msg.user_id || '')?.avatar_url}
                alt={msg.user_name || 'User'}
                size={28}
              />
              <div className="flex-1">
                <span className="font-bold mr-2">{msg.user_name}:</span>
                <span>{msg.message}</span>
                {msg.is_pending && <span className="text-xs italic text-gray-400"> (Sending...)</span>}
              </div>
              {isHost && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <button className="ml-2 p-1 hover:bg-gray-700 rounded-full">
                        ...
                      </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleModerationAction(msg.user_id!, 'mute_chat')}>
                      Timeout User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleModerationAction(msg.user_id!, 'hide_message', msg.id)}>
                      Hide Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-700 flex-none">
        <div className="flex">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={canPublishData ? "Say something..." : "You have been muted by a moderator."}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-l-md p-2 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            disabled={!canPublishData}
          />
          <button
            type="submit"
            className={`bg-gray-600 text-white p-2 rounded-r-md hover:bg-gray-700 ${!canPublishData ? 'opacity-50 cursor-not-allowed' : ''}`}

            disabled={!canPublishData}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};