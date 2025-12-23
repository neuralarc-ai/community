'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard as DashboardIcon, MessageSquare, Presentation, Award, Settings, Home, Calendar, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/app/lib/supabaseClient';
import { Profile } from '@/app/types';

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  isCollapsible?: boolean;
  onCloseMobile: () => void;
}

export default function LeftSidebar({ isOpen, onToggle, isMobile, isCollapsible, onCloseMobile }: LeftSidebarProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Profile['role'] | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    fetchUserRole();
  }, [supabase]);

  const navItems = useMemo(() => [
    ...(userRole === 'admin' ? [{
      href: '/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      mainColor: '#f97316', // Orange-500 hex
      mainColorOpacity: 'rgba(249, 115, 22, 0.11)'
    }] : []),
    {
      href: '/posts',
      label: 'Posts',
      icon: MessageSquare,
      mainColor: '#E7B31B', // Admin Yellow hex
      mainColorOpacity: 'rgba(231, 179, 27, 0.11)'
    },
    {
      href: '/workshops',
      label: 'Conclave',
      icon: Presentation,
      mainColor: '#27584F', // Conclave Green hex
      mainColorOpacity: 'rgba(39, 88, 79, 0.11)'
    },
    {
      href: '/flux-dashboard',
      label: 'Flux Leaderboard',
      icon: Award,
      mainColor: '#FFB6C1', // LightPink hex
      mainColorOpacity: 'rgba(255, 182, 193, 0.11)'
    },
    {
      href: '/profile/settings',
      label: 'Settings',
      icon: Settings,
      mainColor: '#C084FC', // Fuchsia-400 hex (light purple)
      mainColorOpacity: 'rgba(192, 132, 252, 0.11)'
    },
  ], [userRole]);

  // Determine the active index for the glider
  const activeIndex = useMemo(() => {
    const currentPath = pathname;
    for (let i = 0; i < navItems.length; i++) {
      if (currentPath.startsWith(navItems[i].href)) {
        return i;
      }
    }
    return 0; // Default to the first item if no match
  }, [pathname, navItems]);

  const totalNavItems = navItems.length;

  return (
    <>
      <style jsx>{`
        /* eslint-disable react/no-unknown-property */
        .radio-nav-container {
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 1rem 0.5rem; /* Adjusted padding */
        }

        .radio-nav-container input {
          cursor: pointer;
          appearance: none;
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .radio-nav-container .glider-container {
          position: absolute;
          left: 0;
          top: 0; /* Adjusted top */
          bottom: 0;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(27, 27, 27, 1) 50%,
              rgba(0, 0, 0, 0) 100%);
          width: 1px;
          pointer-events: none;
          margin-top: 1rem; /* Match parent padding */
          margin-bottom: 1rem; /* Match parent padding */
        }

        .radio-nav-container .glider-container .glider {
          position: relative;
          height: calc(100% / var(--total-radio));
          width: 100%;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              var(--main-color) 50%,
              rgba(0, 0, 0, 0) 100%);
          transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56);
          transform: translateY(${activeIndex * 100}%); /* Dynamically set transform */
        }

        .radio-nav-container .glider-container .glider::before {
          content: "";
          position: absolute;
          height: 60%;
          width: 300%;
          top: 50%;
          transform: translateY(-50%);
          background: var(--main-color);
          filter: blur(10px);
        }

        .radio-nav-container .glider-container .glider::after {
          content: "";
          position: absolute;
          left: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(90deg,
              var(--main-color-opacity) 0%,
              rgba(0, 0, 0, 0) 100%);
        }

        .radio-nav-container label {
          cursor: pointer;
          padding: 0.75rem;
          position: relative;
          color: rgb(163, 163, 163);
          transition: all 0.3s ease-in-out;
          border-radius: 0.75rem;
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem; /* Spacing between items */
        }

        .radio-nav-container label:last-child {
          margin-bottom: 0; /* No margin for the last item */
        }

        .radio-nav-container input:checked + label {
          color: var(--main-color);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          "fixed left-0 top-0 lg:top-0 z-40 h-full lg:h-screen transition-all duration-300 ease-in-out flex flex-col bg-[#0F0F0F] border-r border-white/5 backdrop-blur-xl pt-16", /* Removed fixed pt-16, now using padding in radio-nav-container */
          {
            "w-[20 rem]": !isMobile, // Always wide on desktop/tablet
            "translate-x-0 w-full": isOpen && isMobile,
            "-translate-x-full": !isOpen && isMobile,
          }
        )}
        style={{
          '--main-color': navItems[activeIndex]?.mainColor || '#f97316', // Fallback to orange
          '--main-color-opacity': navItems[activeIndex]?.mainColorOpacity || 'rgba(249, 115, 22, 0.11)', // Fallback to orange
          '--total-radio': totalNavItems,
        } as React.CSSProperties}
      >
        <div className="radio-nav-container">
          {navItems.map((item, index) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <div
                key={item.href}
                style={isActive ? {
                  '--main-color': item.mainColor,
                  '--main-color-opacity': item.mainColorOpacity,
                } as React.CSSProperties : undefined}
              >
                <input
                  type="radio"
                  id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                  name="nav-menu"
                  checked={isActive}
                  readOnly
                />
                <Link href={item.href} onClick={onCloseMobile}>
                  <label htmlFor={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`} className="text-base">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </label>
                </Link>
              </div>
            );
          })}
          <div className="glider-container">
            <div className="glider"></div>
          </div>
        </div>
      </div>
    </>
  );
}
