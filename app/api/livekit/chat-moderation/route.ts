import { RoomServiceClient } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

export async function POST(request: NextRequest) {
  let response: NextResponse<any> = NextResponse.json({});
  response = setCorsHeaders(request, response);
  try {
    const { roomName, identity, action, workshopId } = await request.json()

    if (!roomName || !identity || !action || !workshopId) {
      response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response = setCorsHeaders(request, response);
      return response;
    }

    // 1. Verify the requester is the Host of the workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      response = NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
      response = setCorsHeaders(request, response);
      return response;
    }

    if (workshop.host_id !== user.id) {
      response = NextResponse.json({ error: 'Forbidden: Only the host can manage participants' }, { status: 403 });
      response = setCorsHeaders(request, response);
      return response;
    }

    // 2. Perform the chat moderation action
    if (action === 'mute_chat') {
      await roomService.updateParticipant(roomName, identity, undefined, {
        canPublishData: false,
      })
    } else if (action === 'unmute_chat') {
      await roomService.updateParticipant(roomName, identity, undefined, {
        canPublishData: true,
      })
    } else {
      response = NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
      response = setCorsHeaders(request, response);
      return response;
    }

    let successResponse: NextResponse<any> = NextResponse.json({ success: true });
    successResponse = setCorsHeaders(request, successResponse);
    return successResponse;
  } catch (error: any) {
    console.error('Error managing chat participant permissions:', error)
    let errorResponse: NextResponse<any> = NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    errorResponse = setCorsHeaders(request, errorResponse);
    return errorResponse;
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
