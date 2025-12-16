'use client'

import { Users, MessageSquare, Presentation, Video, MessageCircle, Calendar, UserPlus } from 'lucide-react'
import { mockStats, mockActivity } from '@/app/data/mockData'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your community activities</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                {stat.id === 'members' && <Users size={24} className="text-gray-900" />}
                {stat.id === 'posts' && <MessageSquare size={24} className="text-gray-900" />}
                {stat.id === 'workshops' && <Presentation size={24} className="text-gray-900" />}
                {stat.id === 'meetings' && <Video size={24} className="text-gray-900" />}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</p>
                <span className={`text-sm ${stat.change.includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {mockActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {activity.type === 'post' && <MessageCircle size={20} className="text-gray-600" />}
                {activity.type === 'workshop' && <Calendar size={20} className="text-gray-600" />}
                {activity.type === 'meeting' && <Video size={20} className="text-gray-600" />}
                {activity.type === 'member' && <UserPlus size={20} className="text-gray-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
