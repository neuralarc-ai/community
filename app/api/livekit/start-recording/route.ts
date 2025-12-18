import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'

export async function POST(request: NextRequest) {
  try {
    const { roomName, workshopId } = await request.json()
    
    if (!roomName || !workshopId) {
      return NextResponse.json(
        { error: 'Missing required fields: roomName, workshopId' },
        { status: 400 }
      )
    }

    // Verify user is authenticated and is the host
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is the host of this workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id, status')
      .eq('id', workshopId)
      .eq('host_id', user.id)
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found or user is not the host' },
        { status: 403 }
      )
    }

    if (workshop.status !== 'LIVE') {
      return NextResponse.json(
        { error: 'Workshop must be LIVE to start recording' },
        { status: 400 }
      )
    }

    // Initialize LiveKit Egress client
    const egressClient = new EgressClient(
      process.env.LIVEKIT_URL!, // Base URL for Egress client
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    )

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `workshop-${workshopId}-${timestamp}.mp4`

    // Extract project ref from Supabase URL
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '')

    // Configure S3 upload to Supabase Storage
    const fileOutput = new EncodedFileOutput({
      filepath: filename,
      output: {
        case: 's3',
        value: new S3Upload({
          accessKey: projectRef, // Supabase S3 uses project ref as access key
          secret: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for S3 access
          region: 'us-east-1', // Supabase S3 region is always us-east-1
          bucket: 'recordings',
          endpoint: `${projectRef}.supabase.co/storage/v1/s3`,
          forcePathStyle: true,
        }),
      },
    })

    // Start recording
    const egressInfo = await egressClient.startRoomCompositeEgress(
      roomName,
      {
        file: fileOutput,
      },
      {
        layout: 'grid', // You can customize layout: 'grid', 'speaker', etc.
      }
    )

    return NextResponse.json({
      egressId: egressInfo.egressId,
      status: egressInfo.status,
      filename,
    })

  } catch (error) {
    console.error('Error starting recording:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Stop recording endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const egressId = searchParams.get('egressId')
    const workshopId = searchParams.get('workshopId')
    
    if (!egressId || !workshopId) {
      return NextResponse.json(
        { error: 'Missing required parameters: egressId, workshopId' },
        { status: 400 }
      )
    }

    // Verify user is authenticated and is the host
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is the host
    const { error: workshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', workshopId)
      .eq('host_id', user.id)
      .single()

    if (workshopError) {
      return NextResponse.json(
        { error: 'Workshop not found or user is not the host' },
        { status: 403 }
      )
    }

    // Stop the egress
    const egressClient = new EgressClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    )

    await egressClient.stopEgress(egressId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error stopping recording:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

