import { RoomServiceClient } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    const { roomName, identity, action, workshopId } = await request.json()
    
    if (!roomName || !identity || !action || !workshopId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Verify the requester is the Host of the workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 })
    }

    if (workshop.host_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the host can manage participants' }, { status: 403 })
    }

    // 2. Perform the action
    if (action === 'promote') {
      await roomService.updateParticipant(roomName, identity, undefined, {
        canPublish: true,
        canSubscribe: true,
      })
    } else if (action === 'demote') {
      await roomService.updateParticipant(roomName, identity, undefined, {
        canPublish: false,
        canSubscribe: true,
      })
    } else if (action === 'remove') {
      await roomService.removeParticipant(roomName, identity)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error managing participant:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

