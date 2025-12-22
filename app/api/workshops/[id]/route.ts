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

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can update workshops' },
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
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching workshop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshop' },
      { status: 500 }
    )
  }
}

