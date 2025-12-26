import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, is_archived } = body

    if (!status && typeof is_archived === 'undefined') {
      return NextResponse.json(
        { error: 'Status or is_archived is required' },
        { status: 400 }
      )
    }

    // Fetch user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Fetch workshop to check host_id
    const { data: workshop, error: fetchWorkshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', id)
      .single()

    if (fetchWorkshopError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
    }

    // Only host can update status or archive status
    if (user.id !== workshop.host_id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the host can update this workshop' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'ENDED') {
        updateData.ended_at = new Date().toISOString()
      }
    }
    if (typeof is_archived !== 'undefined') {
      updateData.is_archived = is_archived
    }

    const { data, error } = await supabase
      .from('workshops')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to update workshop' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('workshops')
      .select('*, host:profiles(username,full_name,avatar_url)')
      .eq('id', id)
      .single()

    if (error) throw error

    // Fetch waitlist count
    const { count: waitlist_count, error: waitlistError } = await supabase
      .from('workshop_waitlist')
      .select('id', { count: 'exact', head: true })
      .eq('workshop_id', id)

    if (waitlistError) {
      console.error('Error fetching waitlist count:', waitlistError)
      // Continue without waitlist count if there's an error
    }

    const workshopData = { ...data, waitlist_count }

    return NextResponse.json(workshopData)
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshop' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch workshop to check host_id
    const { data: workshop, error: fetchWorkshopError } = await supabase
      .from('workshops')
      .select('host_id, title')
      .eq('id', id)
      .single()

    if (fetchWorkshopError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
    }

    // Only host can delete workshop
    console.log("User ID:", user.id)
    console.log("Workshop Host ID:", workshop.host_id)
    console.log("Workshop ID:", id)
    if (user.id !== workshop.host_id) {
      return NextResponse.json(
        { error: 'Forbidden - Only the host can delete this workshop' },
        { status: 403 }
      )
    }

    // Delete related data first (waitlist entries)
    const { error: deleteWaitlistError } = await supabase
      .from('workshop_waitlist')
      .delete()
      .eq('workshop_id', id)

    if (deleteWaitlistError) {
      console.error('Error deleting waitlist entries:', deleteWaitlistError)
      // Continue with workshop deletion even if waitlist deletion fails
    }

    // Delete the workshop
    const { error: deleteError } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting workshop:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete workshop' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Workshop deleted successfully',
      workshopTitle: workshop.title
    })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json(
      { error: 'Failed to delete workshop' },
      { status: 500 }
    )
  }
}

