import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get('search')

  try {
    const supabase = await createServerClient()

    let query = supabase
      .from('workshops')
      .select('*')
      .order('start_time', { ascending: true })

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    const { data: workshops, error: fetchError } = await query

    if (fetchError) throw fetchError

    // Get total count of workshops
    const { count: totalWorkshopsCount, error: countError } = await supabase
      .from('workshops')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      console.error('Error fetching total workshops count:', countError)
    }

    return NextResponse.json({ workshops, totalWorkshopsCount })
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, start_time, status } = body

    if (!title || !start_time) {
      return NextResponse.json(
        { error: 'Title and start time are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('workshops')
      .insert([{
        host_id: session.user.id,
        title,
        description,
        start_time,
        status: status || 'SCHEDULED'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    )
  }
}

