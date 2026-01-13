"use client";

import ControlBar from "@/app/components/ControlBar";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import SidebarTabs from "../../app/components/conclave/SidebarTabs";
import AudioConclaveView from "./stages/AudioConclaveView";
import VideoStage from "./stages/VideoStage";
import { useState, useEffect } from "react";

interface ConclaveRoomProps {
  token: string;
  serverUrl: string;
  workshop: {
    id: string;
    title: string;
    type: "AUDIO" | "VIDEO";
    host_id: string;
  };
  userId: string;
  userRole: string | null;
  onEndLive: () => Promise<boolean | void>;
  defaultSidebarOpen?: boolean;
  roomName: string;
}

export default function ConclaveRoom({
  token,
  serverUrl,
  workshop,
  userId,
  userRole,
  onEndLive,
  defaultSidebarOpen = false,
  roomName,
}: ConclaveRoomProps) {
  const isHost = workshop.host_id === userId;

  // Manage sidebar state locally with responsive default
  const [isSidebarOpen, setIsSidebarOpen] = useState(defaultSidebarOpen);

  // Auto-hide sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth < 768 &&
        isSidebarOpen &&
        defaultSidebarOpen === false
      ) {
        setIsSidebarOpen(false);
      }
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, defaultSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="relative w-full h-[80vh] flex flex-col text-white overflow-hidden">
      
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        className="flex-1 flex flex-col relative bg-background"
        data-lk-theme="default"
      >
        
        <div className="flex flex-1 gap-4 relative overflow-hidden bg-background">
          
          <main className="flex-1 relative min-w-0">
            {workshop.type === "AUDIO" ? (
              <AudioConclaveView onLeave={onEndLive} userRole={userRole} />
            ) : (
              <VideoStage workshopId={workshop.id} />
            )}
          </main>

          
          <aside
            className={`
              fixed inset-y-0 right-0 z-40 w-80 
              transform transition-transform duration-300 ease-in-out
              md:relative md:translate-x-0 md:inset-auto md:z-auto
              ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
            `}
            aria-label="Conference sidebar"
          >
            <SidebarTabs
              onClose={toggleSidebar}
              workshopId={workshop.id}
              isHost={isHost}
            />
          </aside>

          
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 z-30 md:hidden"
              onClick={toggleSidebar}
              aria-hidden="true"
            />
          )}
        </div>

        
        {workshop.type === "VIDEO" && (
            <div className="pointer-events-auto max-w-screen-2xl mx-auto px-4 pb-4">
              <ControlBar
                workshopId={workshop.id}
                roomName={roomName}
                type={workshop.type}
                onEndLive={onEndLive}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
              />
            </div>
        )}
      </LiveKitRoom>
    </div>
  );
}
