"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "./LeftSidebar";
import Header from "@/app/components/Header";
import Footer from "./Footer";
import { useMediaQuery, cn } from "@/lib/utils";

const MOBILE_HEADER_HEIGHT = "56px"; // h-14
const DESKTOP_HEADER_HEIGHT = "64px"; // h-16
const SIDEBAR_WIDTH_DESKTOP = "16rem"; // 64
const SIDEBAR_WIDTH_TABLET = "14rem"; // 56

interface MainLayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function MainLayoutClientWrapper({
  children,
}: MainLayoutClientWrapperProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync sidebar state AFTER media query resolves
  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  const headerHeight = isDesktop ? DESKTOP_HEADER_HEIGHT : MOBILE_HEADER_HEIGHT;

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseMobileSidebar = () => {
    if (!isDesktop) setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      {/* Header */}
      <Header onMenuClick={handleToggleSidebar} headerHeight={headerHeight} />

      <div className="relative flex flex-1">
        {/* Sidebar */}
        <LeftSidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          isMobile={!isDesktop}
          onCloseMobile={handleCloseMobileSidebar}
          headerHeight={headerHeight}
        />

        {/* Mobile overlay */}
        {!isDesktop && isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={handleCloseMobileSidebar}
          />
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out"
          )}
          style={{
            // paddingTop: headerHeight,
            marginLeft:
              isDesktop && isSidebarOpen
                ? `clamp(${SIDEBAR_WIDTH_TABLET}, 20vw, ${SIDEBAR_WIDTH_DESKTOP})`
                : "0px",
          }}
        >
          <div className="mx-auto w-full max-w-screen-xl flex-1 p-4">
            {children}
          </div>

          <Footer />
        </main>
      </div>
    </div>
  );
}
