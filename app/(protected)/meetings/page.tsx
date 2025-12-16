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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meetings...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Online Meetings</h1>
            <p className="text-gray-600">Schedule and manage community meetings</p>
          </div>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
            Schedule Meeting
          </button>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs font-medium">
                  {meeting.type}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">{meeting.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{meeting.agenda}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar size={16} />
                  <span>{formatDate(meeting.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock size={16} />
                  <span>{meeting.time} ({meeting.duration} min)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
                  <Video size={16} />
                  Join Meeting
                </button>
                <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
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
