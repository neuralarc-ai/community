import { AccessToken } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { awardFlux } from '@/lib/flux'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName, workshopId } = await request.json()

    if (!roomName || !participantName || !workshopId) {
      const response = NextResponse.json(
        { error: 'Missing required fields: roomName, participantName, workshopId' },
        { status: 400 }
      )
      return setCorsHeaders(request, response);
    }

    // Verify user is authenticated and check if they're the host
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      return setCorsHeaders(request, response);
    }

    // Check if user is the host of this workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id, status, type')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      const response = NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
      return setCorsHeaders(request, response);
    }

    const isHost = workshop.host_id === user.id
    
    // In Conclave mode, listeners start with canPublish: false
    // They must be promoted by the host to speak
    const canPublish = isHost

    // Create LiveKit access token
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: user.id,
        name: participantName,
        metadata: JSON.stringify({
          role: isHost ? 'host' : 'listener',
          handRaised: false
        })
      }
    )

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
      canPublishData: true, // Required for "Raise Hand" data packets
      canUpdateOwnMetadata: true, // Required for participants to raise/lower hands
    })

    const token = await at.toJwt()

    // Award flux points for joining a conclave
    const fluxAwardResult = await awardFlux(user.id, 'CONCLAVE')
    console.log('Flux award result for conclave join:', fluxAwardResult)

    const finalResponse = NextResponse.json({
      token,
      serverUrl: process.env.LIVEKIT_URL,
      canPublish,
      type: workshop.type
    });
    return setCorsHeaders(request, finalResponse);

  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
