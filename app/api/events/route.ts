import { NextRequest, NextResponse } from 'next/server'
import { mockWorkshops } from '@/app/data/mockData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get('search')

  try {
    let workshops = mockWorkshops

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      workshops = mockWorkshops.filter(
        (workshop) =>
          workshop.title.toLowerCase().includes(searchLower) ||
          workshop.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ workshops, totalWorkshopsCount: workshops.length })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'workshop') {
      const newWorkshop = {
        id: mockWorkshops.length + 1,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        duration: parseInt(data.duration),
        maxParticipants: parseInt(data.maxParticipants),
        enrolled: 0,
        link: data.link
      }

      mockWorkshops.push(newWorkshop)
      return NextResponse.json(newWorkshop, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Invalid event type' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
