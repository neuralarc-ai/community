'use client'

import { Users, MessageSquare, Presentation, Video, MessageCircle, Calendar, UserPlus, Activity } from 'lucide-react'
import { mockStats, mockActivity } from '@/app/data/mockData'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'

export default function Dashboard() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Overview of your community activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat) => (
          <Card key={stat.id} className="bg-card/40 backdrop-blur-md border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/5 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] transition-all duration-300 group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground group-hover:text-orange-200 transition-colors duration-300">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 group-hover:shadow-[0_0_10px_rgba(249,115,22,0.1)] transition-all duration-300">
                {stat.id === 'members' && <Users size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                {stat.id === 'posts' && <MessageSquare size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                {stat.id === 'workshops' && <Presentation size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
                {stat.id === 'meetings' && <Video size={18} className="text-muted-foreground group-hover:text-orange-400 transition-colors" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-4xl font-heading font-bold text-white tracking-tighter group-hover:scale-105 transition-transform duration-300 origin-left">
                    {stat.value}
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
    </div>
  )
}
