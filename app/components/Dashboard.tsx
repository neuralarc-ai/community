'use client'

import { Users, MessageSquare, Presentation, Video, MessageCircle, Calendar, UserPlus } from 'lucide-react'
import { mockStats, mockActivity } from '@/app/data/mockData'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="page-title mb-2">Dashboard</h1>
          <p className="page-subtitle">Overview of your community activities</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <div key={stat.id} className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent-yellow)] rounded-xl flex items-center justify-center flex-shrink-0">
                {stat.id === 'members' && <Users size={24} className="text-[var(--text-primary)]" />}
                {stat.id === 'posts' && <MessageSquare size={24} className="text-[var(--text-primary)]" />}
                {stat.id === 'workshops' && <Presentation size={24} className="text-[var(--text-primary)]" />}
                {stat.id === 'meetings' && <Video size={24} className="text-[var(--text-primary)]" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">{stat.title}</h3>
                <p className="text-2xl font-semibold text-[var(--text-primary)] mb-1 truncate">{stat.value}</p>
                <span className={`text-sm ${stat.change.includes('+') ? 'text-green-600' : 'text-[var(--text-muted)]'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="card-title mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {mockActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                {activity.type === 'post' && <MessageCircle size={20} className="text-[var(--text-secondary)]" />}
                {activity.type === 'workshop' && <Calendar size={20} className="text-[var(--text-secondary)]" />}
                {activity.type === 'meeting' && <Video size={20} className="text-[var(--text-secondary)]" />}
                {activity.type === 'member' && <UserPlus size={20} className="text-[var(--text-secondary)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">{activity.title}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
