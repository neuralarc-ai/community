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
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Users size={32} className="text-[var(--text-secondary)]" />
            <span className="text-xl font-semibold text-[var(--text-primary)]">Community Portal</span>
          </div>

          <nav className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.href.slice(1))}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  item.active
                    ? 'bg-[var(--accent-yellow)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-medium text-[var(--text-secondary)]">Community Manager</span>
            <div className="w-10 h-10 bg-[var(--accent-yellow)] rounded-full flex items-center justify-center font-semibold text-[var(--text-primary)]">
              CM
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary hidden sm:flex"
            >
              <LogOut size={18} />
              Logout
            </button>
            {/* Mobile menu button - could be expanded in future */}
            <button
              onClick={handleLogout}
              className="sm:hidden btn-secondary p-2"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-[var(--border-color)] pt-4 pb-2">
          <nav className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveSection(item.href.slice(1))}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  item.active
                    ? 'bg-[var(--accent-yellow)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
