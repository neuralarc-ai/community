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
    <div className="container max-w-4xl py-8 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Workshops</h1>
            <p className="text-muted-foreground">Schedule and manage online workshops</p>
          </div>
          <Button className="gap-2">
            <Plus size={16} />
            Schedule Workshop
          </Button>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-all duration-200">
              {/* Colored Header Area */}
              <div className="bg-muted/50 p-6 border-b border-border">
                <div className="flex items-center gap-2 mb-3 text-primary font-medium">
                  <Calendar size={16} />
                  <span className="text-sm">{formatDate(workshop.date)} at {workshop.time}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{workshop.title}</h3>
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
                  <Button className="flex-1 gap-2" variant="default">
                    <Video size={16} />
                    Join
                  </Button>
                  <Button variant="outline" className="gap-2 bg-background">
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
