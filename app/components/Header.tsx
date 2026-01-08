"use client";

import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { createClient } from "@/app/lib/supabaseClient";
import { Profile } from "@/app/types";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/utils";
import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";

interface HeaderProps {
  onMenuClick?: () => void;
  headerHeight?: string;
}

export default function Header({ onMenuClick, headerHeight }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(() => createClient()); // Create once
  const [theme, setTheme] = useState<"light" | "dark">("light"); // Default fallback

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [search, setSearch] = useState("");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Initialize theme on mount (localStorage + system preference)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute("data-theme", savedTheme);
    } else {
      // No saved theme → use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const systemTheme = prefersDark ? "dark" : "light";
      setTheme(systemTheme);
      document.body.setAttribute("data-theme", systemTheme);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        // Only react if user hasn't manually chosen a theme
        const newTheme = mediaQuery.matches ? "dark" : "light";
        setTheme(newTheme);
        document.body.setAttribute("data-theme", newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Load profile
  useEffect(() => {
    getCurrentUserProfile()
      .then((data) => {
        setProfile(data);
        setLoadingProfile(false);
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);
        setLoadingProfile(false);
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.setAttribute("data-theme", newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim();

    let basePath = "/posts"; // default
    if (pathname.startsWith("/posts")) basePath = "/posts";
    else if (pathname.startsWith("/workshops")) basePath = "/workshops";
    else if (pathname.startsWith("/meetings")) basePath = "/meetings";
    else if (pathname.startsWith("/dashboard")) basePath = "/dashboard";

    router.push(
      query ? `${basePath}?search=${encodeURIComponent(query)}` : basePath
    );
  };

  const logoSrc =
    theme === "dark" ? "/logo Sphere.png" : "/logo Sphere black.png";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-foreground/5 bg-card"
      style={{ height: headerHeight }}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-2">
          {onMenuClick && !isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground lg:hidden"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8">
              <Image
                src={logoSrc}
                alt="Sphere Logo"
                fill
                sizes="(max-width: 640px) 28px, 32px"
                className="object-contain"
                priority // Important for header logo
              />
            </div>
            <span className="text-lg sm:text-xl font-bold font-heading text-foreground tracking-tight hidden md:block">
              Sphere
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 mx-2 sm:mx-4 md:mx-4 lg:mx-8 lg:max-w-4xl"
        >
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-2 bg-foreground/5 border border-foreground/5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/10 transition-all"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 min-w-max">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-foreground/5"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-foreground/5"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
          </div>

          <div className="h-6 w-px bg-foreground/10 mx-1" />

          {loadingProfile ? (
            <div className="w-24 h-8 bg-foreground/5 rounded-md animate-pulse" />
          ) : profile ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${profile.id}`} className="group">
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  size={32}
                  className="ring-2 ring-transparent group-hover:ring-foreground/20 transition-all"
                />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="bg-foreground text-black hover:bg-foreground/90"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
