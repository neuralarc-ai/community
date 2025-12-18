'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { Workshop } from '@/app/types'
import { Calendar, Clock, Users, Video, Edit, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/components/ui/button'

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setWorkshops(data.workshops)
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-[1400px] py-8 mx-auto px-6">
      <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Workshops</h1>
            <p className="text-muted-foreground">Schedule and manage online workshops</p>
          </div>
          <Button className="gap-2 bg-[#27584F]/80 hover:bg-[#27584F] text-white shadow-sm hover:shadow-[0_0_20px_rgba(39,88,79,0.2)]">
            <Plus size={16} />
            Schedule Workshop
          </Button>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden border-[#27584F]/50 shadow-sm hover:shadow-[0_0_20px_rgba(39,88,79,0.15)] hover:border-[#27584F]/50 transition-all duration-300 bg-card/40 backdrop-blur-sm group">
              {/* Colored Header Area */}
              <div className="bg-[#27584F]/5 p-6 border-b border-[#27584F]/10 group-hover:bg-[#27584F]/10 transition-colors">
                <div className="flex items-center gap-2 mb-3 text-[#27584F] font-medium">
                  <Calendar size={16} />
                  <span className="text-sm">{formatDate(workshop.date)} at {workshop.time}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-[#27584F] transition-colors">{workshop.title}</h3>
              </div>

              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">{workshop.description}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock size={16} />
                    <span>{workshop.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users size={16} />
                    <span>{workshop.enrolled}/{workshop.maxParticipants} enrolled</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 gap-2 bg-[#27584F]/80 hover:bg-[#27584F] text-white shadow-sm hover:shadow-[0_0_20px_rgba(39,88,79,0.2)]" variant="default">
                    <Video size={16} />
                    Join
                  </Button>
                  <Button variant="outline" className="gap-2 bg-background border border-[#27584F]/30 text-[#27584F] hover:bg-[#27584F]/10 hover:text-[#27584F]">
                    <Edit size={16} />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {workshops.length === 0 && !loading && (
             <div className="text-center py-12">
               <p className="text-muted-foreground text-lg">No workshops scheduled yet.</p>
             </div>
        )}
    </div>
  )
}
