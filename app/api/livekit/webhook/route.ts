import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // ✅ FIX 1: Explicitly type as <any>
  let response: NextResponse<any> = NextResponse.json({});
  response = setCorsHeaders(request, response);

  try {
    const body = await request.json()
    console.log('LiveKit webhook received:', body)

    if (body.event === 'egress_ended') {
      const { egress_id, room_name, file } = body
      
      if (!file || !file.filename) {
        console.error('No file information in egress_ended webhook')
        // ✅ FIX 2: Explicitly type as <any>
        let errorResponse: NextResponse<any> = NextResponse.json({ success: false }, { status: 400 });
        errorResponse = setCorsHeaders(request, errorResponse);
        return errorResponse;
      }

      // Extract workshop ID logic...
      let workshopId = ''
      if (room_name && room_name.startsWith('workshop-')) {
        workshopId = room_name.replace('workshop-', '')
      } else if (file.filename.startsWith('conclaves/')) {
        workshopId = file.filename.split('/')[1]
      }

      if (!workshopId) {
        console.error('Could not extract workshop ID', { room_name, filename: file.filename })
        // ✅ FIX 3: Explicitly type as <any>
        let errorResponse: NextResponse<any> = NextResponse.json({ success: false }, { status: 400 });
        errorResponse = setCorsHeaders(request, errorResponse);
        return errorResponse;
      }
      
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '')
      const recordingUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/recordings/${file.filename}`

      const { error } = await supabase
        .from('workshops')
        .update({ 
          recording_url: recordingUrl,
          status: 'ENDED',
          ended_at: new Date().toISOString()
        })
        .eq('id', workshopId)

      if (error) {
        console.error('Error updating workshop:', error)
        // ✅ FIX 4: Explicitly type as <any>
        let errorResponse: NextResponse<any> = NextResponse.json({ success: false }, { status: 500 });
        errorResponse = setCorsHeaders(request, errorResponse);
        return errorResponse;
      }

      console.log(`Workshop ${workshopId} recording completed: ${recordingUrl}`)
    }

    // ✅ FIX 5: Explicitly type as <any>
    let successResponse: NextResponse<any> = NextResponse.json({ success: true });
    successResponse = setCorsHeaders(request, successResponse);
    return successResponse;

  } catch (error) {
    console.error('Webhook error:', error)
    // ✅ FIX 6: Explicitly type as <any>
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