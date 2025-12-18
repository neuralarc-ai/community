'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Bell, MessageSquare, Menu, LogOut, User as UserIcon } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'
import Avatar from './Avatar'
import { getCurrentUserProfile } from '@/app/lib/getProfile'
import { Profile } from '@/app/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [supabase, setSupabase] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    getCurrentUserProfile().then(setProfile).catch(console.error)
  }, [])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/posts', label: 'Posts' },
    { href: '/meetings', label: 'Meetings' },
    { href: '/workshops', label: 'Workshops' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-6 max-w-[1400px] mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center gap-6 min-w-max">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
               <span className="text-white font-bold font-heading">S</span>
            </div>
            <span className="text-lg font-bold font-heading text-white hidden md:block tracking-tight">
              Sphere
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  pathname.startsWith(link.href) ? "text-white" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Search Bar (Optional/Hidden on smaller screens) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/10 transition-all"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4 min-w-max">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/5">
                    <Bell size={18} />
                </Button>
            </div>

            <div className="h-6 w-px bg-white/10 mx-1" />

            {profile ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 group">
                    <div className="relative">
                        <Avatar src={profile.avatar_url} alt={profile.full_name || 'User'} size={32} className="ring-2 ring-transparent group-hover:ring-white/20 transition-all" />
                    </div>
                </Link>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                </Button>
              </div>
            ) : (
                <Button onClick={() => router.push('/login')} className="bg-white text-black hover:bg-white/90">Log In</Button>
            )}
            
            {/* Mobile Menu Toggle */}
            {onMenuClick && (
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={onMenuClick}>
                  <Menu size={20} />
              </Button>
            )}
        </div>
      </div>
    </header>
  )
}
