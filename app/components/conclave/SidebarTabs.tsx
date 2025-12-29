'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConclaveChat } from '@/components/conclave/chat/ConclaveChat';
import { ParticipantList } from '@/components/conclave/ParticipantList';
import { X } from 'lucide-react';
import { useParticipants } from '@livekit/components-react';

interface SidebarTabsProps {
  onClose: () => void;
  workshopId: string;
  isHost: boolean;
}

type Tab = 'chat' | 'participants';

export default function SidebarTabs({ onClose, workshopId, isHost }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const allParticipants = useParticipants();

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white rounded-l-lg shadow-lg">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            className={cn("text-sm", activeTab === 'chat' ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700")}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </Button>
          <Button
            variant="ghost"
            className={cn("text-sm", activeTab === 'participants' ? "bg-gray-700 text-gray-200" : "text-gray-400 hover:bg-gray-700")}

            onClick={() => setActiveTab('participants')}
          >
            Participants ({allParticipants.length})
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:bg-gray-700"
        >
          <X size={20} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' && (
          <ConclaveChat workshopId={workshopId} isHost={isHost} />
        )}
        {activeTab === 'participants' && (
          <ParticipantList workshopId={workshopId} isHost={isHost} />
        )}
      </div>
    </div>
  );
}
