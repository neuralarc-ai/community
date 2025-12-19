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
import { cn, useMediaQuery } from '@/lib/utils'
import Image from 'next/image'


interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [supabase, setSupabase] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const isDesktop = useMediaQuery('(min-width: 1024px)');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    let currentPath = pathname

    if (search.trim() === '') {
      router.push(currentPath)
    } else {
      let targetPath = '/'
      if (currentPath.startsWith('/posts')) {
        targetPath = '/posts'
      } else if (currentPath.startsWith('/workshops')) {
        targetPath = '/workshops'
      } else if (currentPath.startsWith('/meetings')) {
        targetPath = '/meetings'
      } else if (currentPath.startsWith('/dashboard')) {
        targetPath = '/dashboard'
      } else {
        targetPath = '/posts' // Default search to posts
      }
      router.push(`${targetPath}?search=${encodeURIComponent(search)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Logo and App Name */}
        <div className="flex items-center gap-2">
          {onMenuClick && !isDesktop && (
            <Button variant="ghost" size="icon" className="text-muted-foreground lg:hidden" onClick={onMenuClick}>
                <Menu size={20} />
            </Button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 group-hover:opacity-80 transition-all">
               <Image 
                 src="/logo Sphere.png"
                 alt="Sphere Logo"
                 fill
                 className="object-contain"
               />
            </div>
            <span className="text-xl font-bold font-heading text-white tracking-tight hidden md:block">
              Sphere
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:flex">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/10 transition-all"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

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
        </div>
      </div>
    </header>
  )
}
