"use client";

import { getCurrentUserProfile } from "@/app/lib/getProfile";
import { createClient } from "@/app/lib/supabaseClient";
import { Profile } from "@/app/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";

interface HeaderProps {
  onMenuClick?: () => void;
  headerHeight?: string;
}

export default function Header({ onMenuClick, headerHeight }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [search, setSearch] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Theme setup
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const systemTheme = prefersDark ? "dark" : "light";
      setTheme(systemTheme);
      document.body.setAttribute("data-theme", systemTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
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

  // Tag suggestions effect
  useEffect(() => {
    const fetchTagSuggestions = async () => {
      if (search.length > 0) {
        try {
          const response = await fetch(
            `/api/tags?q=${encodeURIComponent(search)}&limit=5`
          );
          if (response.ok) {
            const data = await response.json();
            setTagSuggestions(data.tags || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Failed to fetch tag suggestions:", error);
          setTagSuggestions([]);
        }
      } else {
        setTagSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchTagSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleTagSelect = (tag: string) => {
    setSearch(tag);
    setShowSuggestions(false);
    // Auto-submit the search
    handleSearchWithTag(tag);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchWithTag(search);
  };

  const handleSearchWithTag = (searchQuery: string) => {
    const query = searchQuery.trim();
    let basePath = "/posts";
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
                priority
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
          className="flex-1 mx-2 sm:mx-4 md:mx-4 lg:mx-8 lg:max-w-4xl relative"
        >
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            </div>
            <input
              ref={searchRef}
              type="search"
              className="block w-full pl-10 pr-10 py-2 bg-foreground/5 border border-foreground/5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/10 transition-all"
              placeholder="Search tags..."
              value={search}
              onChange={handleInputChange}
              onFocus={() => search.length > 0 && setShowSuggestions(true)}
              aria-label="Search tags"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Tag Suggestions Dropdown */}
          {showSuggestions && tagSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-card border border-foreground/10 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              {tagSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagSelect(tag)}
                  className="w-full px-4 py-2 text-left text-foreground text-sm hover:bg-foreground/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#</span>
                    <span>{tag}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Right: Actions + Theme Toggle + Avatar Dropdown */}
        <div className="flex items-center gap-3">
          {loadingProfile ? (
            <div className="w-10 h-10 rounded-full bg-foreground/10 animate-pulse" />
          ) : profile ? (
            <>
              {/* Theme Toggle - Now outside dropdown */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-foreground/5 text-foreground border-foreground/20"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </Button>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 hover:bg-foreground/5"
                  >
                    <Avatar
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      size={40}
                      className="ring-2 ring-transparent hover:ring-foreground/20 transition-all"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        @{profile.username || profile.id}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/profile/${profile.id}`}
                      className="flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
