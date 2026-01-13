"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConclaveChat } from "@/components/conclave/chat/ConclaveChat";
import { ParticipantList } from "@/components/conclave/ParticipantList";
import { X, MessageCircle, Users } from "lucide-react";
import { useParticipants } from "@livekit/components-react";

interface SidebarTabsProps {
  onClose: () => void;
  workshopId: string;
  isHost: boolean;
}

type Tab = "chat" | "participants";

export default function SidebarTabs({
  onClose,
  workshopId,
  isHost,
}: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const allParticipants = useParticipants();

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    {
      id: "participants" as const,
      label: "Participants",
      icon: Users,
      badge: allParticipants.length,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <nav
          className="flex items-center gap-1"
          role="tablist"
          aria-label="Sidebar tabs"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              )}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.badge !== undefined && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {tab.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 md:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Content Panel */}
      <div
        className="flex-1 overflow-hidden"
        id={`${activeTab}-panel`}
        role="tabpanel"
        aria-labelledby={activeTab}
      >
        <div className="h-full overflow-y-auto p-4">
          {activeTab === "chat" && (
            <ConclaveChat workshopId={workshopId} isHost={isHost} />
          )}
          {activeTab === "participants" && (
            <ParticipantList workshopId={workshopId} isHost={isHost} />
          )}
        </div>
      </div>
    </div>
  );
}
