'use client'

import { useState, useEffect } from 'react'
import Header from '@/app/components/Header'
import { Meeting } from '@/app/types'
import { Calendar, Clock, Video, Edit } from 'lucide-react'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setMeetings(data.meetings)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
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
            <p className="mt-4 text-[var(--text-secondary)]">Loading meetings...</p>
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
            <h1 className="page-title mb-2">Online Meetings</h1>
            <p className="page-subtitle">Schedule and manage community meetings</p>
          </div>
          <button className="btn-primary self-start">
            Schedule Meeting
          </button>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="card p-6 border-l-4 border-l-[var(--accent-yellow)]">
              <div className="flex justify-between items-start mb-4">
                <span className="badge">
                  {meeting.type}
                </span>
              </div>

              <h3 className="card-title mb-3">{meeting.title}</h3>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">{meeting.agenda}</p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                  <Calendar size={16} />
                  <span>{formatDate(meeting.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                  <Clock size={16} />
                  <span>{meeting.time} ({meeting.duration} min)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-primary flex-1 flex justify-center items-center gap-2">
                  <Video size={16} />
                  Join Meeting
                </button>
                <button className="btn-secondary flex justify-center items-center gap-2">
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
