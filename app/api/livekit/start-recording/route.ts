import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

export async function POST(request: NextRequest) {
  let response: NextResponse<any> = NextResponse.json({});
  response = setCorsHeaders(request, response);
  try {
    const { roomName, workshopId } = await request.json()
    
    if (!roomName || !workshopId) {
      response = NextResponse.json(
        { error: 'Missing required fields: roomName, workshopId' },
        { status: 400 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    // Verify user is authenticated and is the host
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      let response: NextResponse<any> = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    // Verify user is the host of this workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id, status, type')
      .eq('id', workshopId)
      .eq('host_id', user.id)
      .single()

    if (workshopError || !workshop) {
      let response: NextResponse<any> = NextResponse.json(
        { error: 'Workshop not found or user is not the host' },
        { status: 403 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    if (workshop.status !== 'LIVE') {
      let response: NextResponse<any> = NextResponse.json(
        { error: 'Workshop must be LIVE to start recording' },
        { status: 400 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    // Initialize LiveKit Egress client
    const egressClient = new EgressClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    )

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `conclaves/${workshopId}/${timestamp}.mp4`

    // Extract project ref from Supabase URL
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '')

    // Configure S3 upload to Supabase Storage
    const fileOutput = new EncodedFileOutput({
      filepath: filename,
      output: {
        case: 's3',
        value: new S3Upload({
          accessKey: projectRef,
          secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          region: 'us-east-1',
          bucket: 'recordings',
          endpoint: `${projectRef}.supabase.co/storage/v1/s3`,
          forcePathStyle: true,
        }),
      },
    })

    // Start recording with layout specific to Conclave type
    const egressInfo = await egressClient.startRoomCompositeEgress(
      roomName,
      {
        file: fileOutput,
      },
      {
        layout: workshop.type === 'AUDIO' ? 'speaker' : 'grid',
      }
    )

    let finalResponse: NextResponse<any> = NextResponse.json({
      egressId: egressInfo.egressId,
      status: egressInfo.status,
      filename,
    });
    finalResponse = setCorsHeaders(request, finalResponse);
    return finalResponse;

  } catch (error) {
    console.error('Error starting recording:', error)
    let errorResponse: NextResponse<any> = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    errorResponse = setCorsHeaders(request, errorResponse);
    return errorResponse;
  }
}

// Stop recording endpoint
export async function DELETE(request: NextRequest) {
  let response: NextResponse<any> = NextResponse.json({});
  response = setCorsHeaders(request, response);
  try {
    const { searchParams } = new URL(request.url)
    const egressId = searchParams.get('egressId')
    const workshopId = searchParams.get('workshopId')
    
    if (!egressId || !workshopId) {
      response = NextResponse.json(
        { error: 'Missing required parameters: egressId, workshopId' },
        { status: 400 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    // Verify user is authenticated and is the host
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      let response: NextResponse<any> = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    // Verify user is the host
    const { error: workshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', workshopId)
      .eq('host_id', user.id)
      .single()

    if (workshopError) {
      let response: NextResponse<any> = NextResponse.json(
        { error: 'Workshop not found or user is not the host' },
        { status: 403 }
      )
      response = setCorsHeaders(request, response);
      return response;
    }

    // Stop the egress
    const egressClient = new EgressClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    )

    await egressClient.stopEgress(egressId)

    let successResponse: NextResponse<any> = NextResponse.json({ success: true });
    successResponse = setCorsHeaders(request, successResponse);
    return successResponse;

  } catch (error) {
    console.error('Error stopping recording:', error)
    let errorResponse: NextResponse<any> = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    errorResponse = setCorsHeaders(request, errorResponse);
    return errorResponse;
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
