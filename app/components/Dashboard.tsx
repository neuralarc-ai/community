'use client'

import { useEffect, useState } from 'react'
import { Users, MessageSquare, Presentation, Video, MessageCircle, Calendar, UserPlus, Activity, ShieldAlert, Mail, Clock } from 'lucide-react'
import { mockActivity } from '@/app/data/mockData'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Profile } from '@/app/types'
import Avatar from './Avatar'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users'>('stats')
  const [users, setUsers] = useState<Profile[]>([])
  const [totalMembers, setTotalMembers] = useState<number | null>(null)
  const [totalPosts, setTotalPosts] = useState<number>(Math.floor(Math.random() * 200) + 50) // Random count for Active Discussions
  const [totalWorkshops, setTotalWorkshops] = useState<number | null>(null)
  const [totalMeetings, setTotalMeetings] = useState<number>(Math.floor(Math.random() * 20) + 5) // Random count for Meetings Scheduled
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'stats') {
      fetchTotalMembers()
      fetchTotalWorkshops()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchTotalMembers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setTotalMembers(data.totalUsers)
      }
    } catch (error) {
      console.error('Failed to fetch total members:', error)
    }
  }

  const fetchTotalWorkshops = async () => {
    try {
      const response = await fetch('/api/workshops')
      if (response.ok) {
        const data = await response.json()
        setTotalWorkshops(data.totalWorkshopsCount)
      }
    } catch (error) {
      console.error('Failed to fetch total workshops:', error)
    }
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Comprehensive overview and community management</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'stats' 
                ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'users' 
                ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {activeTab === 'stats' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'members', title: 'Total Members', value: totalMembers, change: '+12%', icon: 'Users' },
              { id: 'posts', title: 'Active Discussions', value: totalPosts, change: '+5%', icon: 'MessageSquare' },
              { id: 'conclaves', title: 'Conclave This Month', value: totalWorkshops, change: '+8%', icon: 'Presentation' },
              { id: 'meetings', title: 'Meetings Scheduled', value: totalMeetings, change: '+2%', icon: 'Video' },
            ].map((stat) => (
              <Card key={stat.id} className="bg-card/40 backdrop-blur-md border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 group cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-orange-200 transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.1)] transition-all duration-300">
                    {stat.icon === 'Users' && <Users size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                    {stat.icon === 'MessageSquare' && <MessageSquare size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                    {stat.icon === 'Presentation' && <Presentation size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                    {stat.icon === 'Video' && <Video size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-4xl font-heading font-bold text-white tracking-tighter group-hover:scale-105 transition-transform duration-300 origin-left">
                        {stat.value?.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border border-white/5 transition-all duration-300 ${
                            stat.change.includes('+') 
                                ? 'text-white bg-white/10 group-hover:bg-orange-500/20 group-hover:border-orange-500/20 group-hover:text-orange-200' 
                                : 'text-muted-foreground bg-white/5 group-hover:bg-white/10'
                        }`}>
                            {stat.change}
                        </span>
                        <span className="text-xs text-muted-foreground group-hover:text-white/60 transition-colors">
                            from last month
                        </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity Section */}
          <Card className="bg-card/30 backdrop-blur-sm border-orange-500/20 overflow-hidden hover:border-orange-500/30 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)]">
            <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                        <Activity className="w-5 h-5 text-orange-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-white">Recent Activity</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {mockActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-6 p-6 hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#0F0F0F] rounded-xl flex items-center justify-center border border-white/5 group-hover:border-white/20 group-hover:bg-white/5 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300">
                            {activity.type === 'post' && <MessageCircle size={22} className="text-muted-foreground group-hover:text-white transition-colors" />}
                            {activity.type === 'workshop' && <Calendar size={22} className="text-muted-foreground group-hover:text-white transition-colors" />}
                            {activity.type === 'meeting' && <Video size={22} className="text-muted-foreground group-hover:text-white transition-colors" />}
                            {activity.type === 'member' && <UserPlus size={22} className="text-muted-foreground group-hover:text-white transition-colors" />}
                        </div>
                        <div className="flex-1 min-w-0 grid gap-1">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-medium text-white truncate group-hover:text-white/90">{activity.title}</p>
                                <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-white/10 transition-colors">{activity.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate group-hover:text-white/70 transition-colors">{activity.description}</p>
                        </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* User Management Section */
        <Card className="bg-card/30 backdrop-blur-sm border-orange-500/20 overflow-hidden hover:border-orange-500/30 transition-colors duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)]">
          <CardHeader className="px-8 pt-8 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <Users className="w-5 h-5 text-orange-400" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">Community Members</CardTitle>
              </div>
              <button 
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/20 transition-all disabled:opacity-50"
              >
                {loadingUsers ? 'Refreshing...' : 'Refresh List'}
              </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-8 py-4">Member</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Joined</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length === 0 && !loadingUsers ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.04] transition-all duration-200 group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.avatar_url} alt={user.full_name} size={40} className="ring-2 ring-white/5 group-hover:ring-orange-500/20" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{user.full_name}</span>
                              <span className="text-xs text-muted-foreground font-mono">u/{user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            user.role === 'admin' 
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                              : 'bg-white/5 text-muted-foreground border-white/10'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-white/5 hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 rounded-lg border border-white/5 hover:border-orange-500/20 transition-all">
                              <ShieldAlert size={16} />
                            </button>
                            <button className="p-2 bg-white/5 hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 rounded-lg border border-white/5 hover:border-orange-500/20 transition-all">
                              <Mail size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

