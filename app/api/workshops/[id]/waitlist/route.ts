import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workshop_id } = await params
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user is already on the waitlist (optional, but good for UX)
    const { data: existingEntry, error: fetchError } = await supabase
      .from('workshop_waitlist')
      .select('id')
      .eq('workshop_id', workshop_id)
      .eq('user_email', email)
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { message: 'You are already on the waitlist.' },
        { status: 200 }
      )
    }

    const { error } = await supabase
      .from('workshop_waitlist')
      .insert({
        workshop_id,
        user_email: email,
        notified: false,
      })

    if (error) throw error

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error joining waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workshop_id } = await params
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify if the current user is the host of the workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', workshop_id)
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
    }

    if (user.id !== workshop.host_id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the host can view the waitlist' },
        { status: 403 }
      )
    }

    const { data: waitlist, error } = await supabase
      .from('workshop_waitlist')
      .select('user_email, created_at')
      .eq('workshop_id', workshop_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(waitlist)
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}

