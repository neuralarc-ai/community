"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard as DashboardIcon,
  MessageSquare,
  Presentation,
  Award,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/app/lib/supabaseClient";
import { Profile } from "@/app/types";
import { motion, AnimatePresence } from "framer-motion";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onCloseMobile: () => void;
  className?: string;
  headerHeight: string;
}

export default function LeftSidebar({
  isOpen,
  onToggle,
  isMobile,
  onCloseMobile,
  className,
  headerHeight,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Profile["role"] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    fetchUserRole();
  }, [supabase]);

  const navItems = useMemo(
    () => [
      ...(userRole === "admin"
        ? [
            {
              href: "/dashboard",
              label: "Dashboard",
              icon: DashboardIcon,
              color: "#F97316",
            },
          ]
        : []),
      {
        href: "/posts",
        label: "Posts",
        icon: MessageSquare,
        color: "#e7b31b",
      },
      {
        href: "/workshops",
        label: "Conclave",
        icon: Presentation,
        color: "#0f766e",
      },
      {
        href: "/flux-dashboard",
        label: "Flux Leaderboard",
        icon: Award,
        color: "#f472b6",
      },
      {
        href: "/profile/settings",
        label: "Settings",
        icon: Settings,
        color: "#8b5cf6",
      },
    ],
    [userRole]
  );

  const activeItem = navItems.find((item) => pathname.startsWith(item.href));

  return (
    <>
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -300) : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 z-40 flex flex-col bg-card backdrop-blur-2xl border-r border-foreground/5",
          "w-64 h-screen pt-[var(--header-height)]",
          className
        )}
        style={{ "--header-height": headerHeight } as React.CSSProperties}
      >
        <nav className="relative flex-1 overflow-y-auto py-6 px-4">
          {/* Smooth moving gradient indicator */}
          <AnimatePresence mode="wait">
            {activeItem && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute left-2 right-2 rounded-xl bg-gradient-to-r opacity-20 pointer-events-none"
                style={{
                  boxShadow: `0 0 30px ${activeItem.color}`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}
          </AnimatePresence>

          <ul className="space-y-2">
            {navItems.map((item, idx) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <motion.li
                  key={item.href || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3  rounded-xl transition-all duration-500 relative overflow-hidden group active:scale-95",
                      isActive
                        ? "text-white font-medium"
                        : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                    )}
                  >
                    {/* Icon with subtle scale animation */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5 relative z-10" />
                    </motion.div>
                    <span className="relative z-10">{item.label}</span>
                    {/* color effect on active */}
                    {isActive && (
                      <motion.div
                        layoutId="active-color"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: `linear-gradient(to right, ${activeItem?.color}, transparent)`,
                        }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
      </motion.aside>
    </>
  );
}
