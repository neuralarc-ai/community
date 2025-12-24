import { NextRequest, NextResponse } from 'next/server'
import { mockWorkshops } from '@/app/data/mockData'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

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

    const successResponse = NextResponse.json({ workshops, totalWorkshopsCount: workshops.length });
    return setCorsHeaders(request, successResponse);
  } catch (error) {
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
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
      const successResponse = NextResponse.json(newWorkshop, { status: 201 });
      return setCorsHeaders(request, successResponse);
    }

    const errorResponse = NextResponse.json(
      { error: 'Invalid event type' },
      { status: 400 }
    );
    return setCorsHeaders(request, errorResponse);
  } catch (error) {
    const errorResponse = NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
