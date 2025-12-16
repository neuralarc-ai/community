'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, LayoutDashboard, MessageSquare, Presentation, Video, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabaseClient'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

export default function Header() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
      active: activeSection === 'dashboard'
    },
    {
      href: '/posts',
      icon: <MessageSquare size={18} />,
      label: 'Posts',
      active: activeSection === 'posts'
    },
    {
      href: '/workshops',
      icon: <Presentation size={18} />,
      label: 'Workshops',
      active: activeSection === 'workshops'
    },
    {
      href: '/meetings',
      icon: <Video size={18} />,
      label: 'Meetings',
      active: activeSection === 'meetings'
    }
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-gray-700" />
            <span className="text-xl font-semibold text-gray-900">Community Portal</span>
          </div>

          <nav className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.href.slice(1))}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  item.active
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Community Manager</span>
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-semibold text-gray-900">
              CM
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
