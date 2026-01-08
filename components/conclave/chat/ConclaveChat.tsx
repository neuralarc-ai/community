"use client";

import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  useCallback,
} from "react";
import {
  useChat,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { createClient } from "@/app/lib/supabaseClient";
import Avatar from "@/app/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/app/components/ui/use-toast";
import { Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  workshop_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  is_hidden?: boolean;
  is_pending?: boolean;
}

interface ConclaveChatProps {
  workshopId: string;
  isHost: boolean;
}

export const ConclaveChat: React.FC<ConclaveChatProps> = ({
  workshopId,
  isHost,
}) => {
  const { toast } = useToast();
  const { send } = useChat();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [profiles, setProfiles] = useState<
    Map<string, { full_name: string; username: string; avatar_url: string }>
  >(new Map());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const canPublishData = localParticipant?.permissions?.canPublishData ?? true;

  // Simple relative time without date-fns
  const formatTime = (dateStr: string) => {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;
    const minute = 60_000;
    const hour = minute * 60;
    const day = hour * 24;

    if (diff < minute) return "now";
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    return `${Math.floor(diff / day)}d ago`;
  };

  // Profile fetching
  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async (identity: string) => {
      if (!identity || profiles.has(identity)) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .eq("id", identity)
        .single();

      if (data) {
        setProfiles((prev) =>
          new Map(prev).set(identity, {
            full_name: data.full_name || data.username || "User",
            username: data.username || "user",
            avatar_url: data.avatar_url || "",
          })
        );
      }
    };

    if (localParticipant?.identity) fetchProfile(localParticipant.identity);
    room?.remoteParticipants.forEach((p) => fetchProfile(p.identity));

    const handleConnect = (p: any) => fetchProfile(p.identity);
    room?.on("participantConnected", handleConnect);
    return () => room?.off("participantConnected", handleConnect);
  }, [localParticipant?.identity, room]);

  // Load history + realtime
  useEffect(() => {
    const supabase = createClient();

    const loadHistory = async () => {
      const { data } = await supabase
        .from("conclave_chat_messages")
        .select("*")
        .eq("workshop_id", workshopId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        setMessages(data as ChatMessage[]);
        setTimeout(scrollToBottom, 100);
      }
    };

    loadHistory();

    const channel = supabase
      .channel(`chat:${workshopId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conclave_chat_messages",
          filter: `workshop_id=eq.${workshopId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.is_hidden) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            const newMessages = [...prev, msg];
            if (!isAtBottom) setUnreadCount((c) => c + 1);
            return newMessages;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [workshopId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
    setIsAtBottom(true);
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) setUnreadCount(0);
  };

  // Send message
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canPublishData || !localParticipant?.identity) return;

    const content = input.trim();
    const userId = localParticipant.identity;
    const profile = profiles.get(userId);
    const userName = profile?.full_name || profile?.username || "You";

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      workshop_id: workshopId,
      user_id: userId,
      user_name: userName,
      message: content,
      created_at: new Date().toISOString(),
      is_pending: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    scrollToBottom();

    try {
      await send(content);

      const supabase = createClient();
      const { data } = await supabase
        .from("conclave_chat_messages")
        .insert({
          workshop_id: workshopId,
          user_id: userId,
          user_name: userName,
          message: content,
        })
        .select()
        .single();

      if (data) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMsg.id ? { ...data, is_pending: false } : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMsg.id ? { ...m, is_pending: false } : m
          )
        );
      }
    } catch (err) {
      toast({ variant: "destructive", description: "Failed to send message" });
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
  };

  const handleHideMessage = async (msgId: string) => {
    if (!isHost) return;
    const supabase = createClient();
    await supabase
      .from("conclave_chat_messages")
      .update({ is_hidden: true })
      .eq("id", msgId);

    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live Chat</h2>
        <Badge variant="secondary">{messages.length}</Badge>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const profile = profiles.get(msg.user_id);
            const isMe = msg.user_id === localParticipant?.identity;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 group -mx-2 px-2 py-1 rounded-md hover:bg-white/5 transition-colors animate-in slide-in-from-bottom-2 duration-300",
                  msg.is_pending && "opacity-60"
                )}
              >
                <Avatar
                  src={profile?.avatar_url}
                  alt={msg.user_name}
                  size={32}
                  fallback={msg.user_name[0]?.toUpperCase()}
                  className="mt-1 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={cn(
                        "font-semibold text-sm flex items-center gap-2",
                        isMe ? "text-blue-400" : "text-white"
                      )}
                    >
                      {msg.user_name}
                      {isMe && <Badge variant="secondary" >You</Badge>}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm break-words mt-0.5">{msg.message}</p>
                  {msg.is_pending && (
                    <span className="text-xs text-neutral-500">Sending...</span>
                  )}
                </div>

                {isHost && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-lg leading-none">⋮</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-neutral-900 border-neutral-800"
                    >
                      <DropdownMenuItem
                        onClick={() => handleHideMessage(msg.id)}
                        className="text-red-400 focus:text-red-400 focus:bg-red-900/20"
                      >
                        Hide Message
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-orange-400">
                        Timeout User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* New messages indicator */}
      {unreadCount > 0 && !isAtBottom && (
        <Button
          onClick={scrollToBottom}
          size="sm"
          variant="secondary"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full shadow-lg z-10"
        >
          <ChevronDown className="h-4 w-4 mr-1" />
          {unreadCount} new {unreadCount === 1 ? "message" : "messages"}
        </Button>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-neutral-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={canPublishData ? "Send a message..." : "You are muted"}
            disabled={!canPublishData}
            className="bg-neutral-900 border-neutral-700 placeholder-neutral-500 focus:border-blue-500"
          />
          <Button
            type="submit"
            disabled={!input.trim() || !canPublishData}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!canPublishData && (
          <p className="text-xs text-orange-400 mt-2 text-center">
            You have been muted by a moderator.
          </p>
        )}
      </form>
    </div>
  );
};
