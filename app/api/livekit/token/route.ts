import { AccessToken } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName, workshopId } = await request.json()
    
    if (!roomName || !participantName || !workshopId) {
      return NextResponse.json(
        { error: 'Missing required fields: roomName, participantName, workshopId' },
        { status: 400 }
      )
    }

    // Verify user is authenticated and check if they're the host
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is the host of this workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id, status, type')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      )
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
    })

    const token = await at.toJwt()

    return NextResponse.json({
      token,
      serverUrl: process.env.LIVEKIT_URL,
      canPublish,
      type: workshop.type
    })

  } catch (error) {
    console.error('Error generating LiveKit token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

