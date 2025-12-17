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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 max-w-[1600px] mx-auto">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4 min-w-max">
          {onMenuClick && (
              <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                  <Menu size={24} className="text-gray-700" />
              </Button>
          )}
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
               <span className="text-white font-bold font-heading">C</span>
            </div>
            <span className="text-xl font-bold font-heading text-gray-900 hidden md:block">
              Community
            </span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl px-4 md:px-8 hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border-none rounded-full bg-gray-100 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder-gray-500"
              placeholder="Search Community..."
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 min-w-max">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1 mr-2">
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-primary hover:bg-gray-100">
                    <MessageSquare size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-primary hover:bg-gray-100">
                    <Bell size={20} />
                </Button>
            </div>

            {profile ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-colors">
                    <div className="relative">
                        <Avatar src={profile.avatar_url} alt={profile.full_name || 'User'} size={32} />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{profile.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">u/{profile.username}</p>
                    </div>
                </Link>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-500 hover:text-red-600 rounded-full"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                </Button>
              </div>
            ) : (
                <Button onClick={() => router.push('/login')}>Log In</Button>
            )}
        </div>
      </div>
    </header>
  )
}
