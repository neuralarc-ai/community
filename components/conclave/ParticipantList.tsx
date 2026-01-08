"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useParticipants,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import Avatar from "@/app/components/Avatar";
import { createClient } from "@/app/lib/supabaseClient";
import {
  Mic,
  MicOff,
  MoreVertical,
  XCircle,
  Crown,
  Hand,
  Pin,
  PinOff,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRoleManager } from "@/hooks/useRoleManager";
import { useSpotlight } from "@/app/hooks/useSpotlight";
import { Participant } from "livekit-client";
import { cn } from "@/lib/utils";

interface ParticipantListProps {
  workshopId: string;
  isHost: boolean;
}

interface Profile {
  full_name: string;
  username: string;
  avatar_url: string;
  role: string;
}

interface ParticipantMetadata {
  canSpeak?: boolean;
  handRaised?: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  workshopId,
  isHost,
}) => {
  const allParticipants = useParticipants();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const { currentSpotlightId, setSpotlight } = useSpotlight(workshopId);

  const localProfile = profiles.get(localParticipant?.identity || "");
  const canManage = isHost || localProfile?.role === "admin";

  // Improved: Better name fallback using participant.name if available
  const getDisplayName = (participant: any) => {
    const profile = profiles.get(participant.identity);

    // Priority: full_name → username → participant.name → identity (truncated) → Anonymous
    return (
      profile?.full_name ||
      profile?.username ||
      participant.name || // LiveKit participant.name (set via token)
      participant.identity.split("|")[0] || // Fallback: truncate if using sub|id format
      participant.identity ||
      "Anonymous"
    );
  };

  const parseMetadata = (metadata: string | undefined): ParticipantMetadata => {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  };

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (allParticipants.length === 0) {
        setProfiles(new Map());
        return;
      }

      const identities = allParticipants.map((p) => p.identity);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, role")
        .in("id", identities);

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      if (!data) {
        setProfiles(new Map());
        return;
      }

      const map = new Map<string, Profile>();
      data.forEach((p) => {
        map.set(p.id, {
          full_name: p.full_name ?? "",
          username: p.username ?? "",
          avatar_url: p.avatar_url ?? "",
          role: p.role ?? "listener",
        });
      });
      setProfiles(map);
    };

    fetchProfiles();
  }, [allParticipants.map((p) => p.identity).join(",")]);

  // Sorted participants
  const displayedParticipants = useMemo(() => {
    const roomMetadata = room.metadata ? JSON.parse(room.metadata) : {};
    const hostIdentity = roomMetadata.host_identity;

    return [...allParticipants]
      .sort((a, b) => {
        if (a.identity === hostIdentity) return -1;
        if (b.identity === hostIdentity) return 1;
        if (a.identity === currentSpotlightId) return -1;
        if (b.identity === currentSpotlightId) return 1;
        if (a.audioLevel > 0.1 && b.audioLevel <= 0.1) return -1;
        if (b.audioLevel > 0.1 && a.audioLevel <= 0.1) return 1;

        const aMeta = parseMetadata(a.metadata);
        const bMeta = parseMetadata(b.metadata);
        if (aMeta.handRaised && !bMeta.handRaised) return -1;
        if (!aMeta.handRaised && bMeta.handRaised) return 1;

        if (a.isLocal) return -1;
        if (b.isLocal) return 1;

        return getDisplayName(a).localeCompare(getDisplayName(b));
      })
      .filter((p) => {
        const name = getDisplayName(p);
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [
    allParticipants,
    profiles,
    searchTerm,
    currentSpotlightId,
    room.metadata,
  ]);

  const handleRemoveParticipant = async (identity: string) => {
    if (!canManage) return;
    // ... your existing logic
  };

  const toggleSpotlight = async (identity: string) => {
    try {
      await setSpotlight(currentSpotlightId === identity ? null : identity);
    } catch (err) {
      console.error("Spotlight error:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Participants
            <Badge variant="secondary" className="ml-2 text-xs">
              {allParticipants.length}
            </Badge>
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {displayedParticipants.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm py-8">
            {searchTerm ? "No participants found" : "No participants yet"}
          </p>
        ) : (
          displayedParticipants.map((participant) => {
            const profile = profiles.get(participant.identity);
            const metadata = parseMetadata(participant.metadata);
            const isSpotlighted = currentSpotlightId === participant.identity;
            const isHostUser = profile?.role === "host";
            const isAdmin = profile?.role === "admin";
            const isSpeaking = participant.audioLevel > 0.1;

            return (
              <div
                key={participant.identity}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all",
                  isSpotlighted && "bg-red-900/20 ring-1 ring-red-500/50",
                  isSpeaking && "bg-blue-900/10 ring-1 ring-green-500/40",
                  "hover:bg-neutral-900"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar
                      src={profile?.avatar_url || ""}
                      alt={getDisplayName(participant)}
                      size={40}
                      fallback={
                        getDisplayName(participant)[0]?.toUpperCase() || "?"
                      }
                    />
                    {isSpeaking && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-green-500 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate max-w-[200px]">
                        {getDisplayName(participant)}
                        {participant.isLocal && (
                          <span className="text-xs text-neutral-400 ml-1">
                            (you)
                          </span>
                        )}
                      </span>

                      {metadata.handRaised && (
                        <Hand className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                      )}

                      {isSpotlighted && (
                        <Badge variant="destructive" className="text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          Spotlight
                        </Badge>
                      )}

                      {isHostUser && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                      {isAdmin && (
                        <Badge
                          variant="outline"
                          className="text-xs border-yellow-600 text-yellow-400"
                        >
                          Admin
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-neutral-400 mt-1">
                      {participant.isMicrophoneEnabled ? (
                        <span className="flex items-center gap-1">
                          <Mic className="h-3 w-3 text-green-500" />
                          Mic on
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MicOff className="h-3 w-3 text-red-500" />
                          Muted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && !participant.isLocal && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-neutral-900 border-neutral-800"
                    >
                      <DropdownMenuItem
                        onClick={() => toggleSpotlight(participant.identity)}
                        className="text-white hover:bg-neutral-800"
                      >
                        {isSpotlighted ? (
                          <>
                            <PinOff className="h-4 w-4 mr-2" />
                            Remove Spotlight
                          </>
                        ) : (
                          <>
                            <Pin className="h-4 w-4 mr-2" />
                            Spotlight Participant
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleRemoveParticipant(participant.identity)
                        }
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove from Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
