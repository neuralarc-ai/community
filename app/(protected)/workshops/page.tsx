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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workshops...</p>
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Workshops</h1>
            <p className="text-gray-600">Schedule and manage online workshops</p>
          </div>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
            Schedule Workshop
          </button>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-yellow-400 to-green-400 p-6 text-gray-900">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">{formatDate(workshop.date)} at {workshop.time}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">{workshop.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={16} />
                    <span>{workshop.duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users size={16} />
                    <span>{workshop.enrolled}/{workshop.maxParticipants} enrolled</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors">
                    <Video size={16} />
                    Join Workshop
                  </button>
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
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
