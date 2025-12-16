'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { Workshop } from '@/app/types'
import { Calendar, Clock, Users, Video, Edit } from 'lucide-react'

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
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading workshops...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="page-title mb-2">Workshops</h1>
            <p className="page-subtitle">Schedule and manage online workshops</p>
          </div>
          <button className="btn-primary self-start">
            Schedule Workshop
          </button>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="card overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--accent-yellow)] to-[var(--accent-green)] p-6 text-[var(--text-primary)]">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">{formatDate(workshop.date)} at {workshop.time}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">{workshop.description}</p>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                    <Clock size={16} />
                    <span>{workshop.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                    <Users size={16} />
                    <span>{workshop.enrolled}/{workshop.maxParticipants} enrolled</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="btn-primary flex-1 flex justify-center items-center gap-2">
                    <Video size={16} />
                    Join Workshop
                  </button>
                  <button className="btn-secondary flex justify-center items-center gap-2">
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
