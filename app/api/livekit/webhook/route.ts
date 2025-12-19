import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify webhook signature (recommended for production)
    // const signature = request.headers.get('x-livekit-signature')
    // You should verify the signature using your LiveKit API secret

    console.log('LiveKit webhook received:', body)

    if (body.event === 'egress_ended') {
      const { egress_id, room_name, file } = body
      
      if (!file || !file.filename) {
        console.error('No file information in egress_ended webhook')
        return NextResponse.json({ success: false }, { status: 400 })
      }

      // Extract workshop ID from room_name (format: workshop-{id})
      // Or from filename (format: conclaves/{id}/{timestamp}.mp4)
      let workshopId = ''
      if (room_name && room_name.startsWith('workshop-')) {
        workshopId = room_name.replace('workshop-', '')
      } else if (file.filename.startsWith('conclaves/')) {
        workshopId = file.filename.split('/')[1]
      }

      if (!workshopId) {
        console.error('Could not extract workshop ID from webhook', { room_name, filename: file.filename })
        return NextResponse.json({ success: false }, { status: 400 })
      }
      
      // Extract project ref from Supabase URL
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].replace('https://', '')
      
      // Construct the public URL for the recording
      const recordingUrl = `https://${projectRef}.supabase.co/storage/v1/object/public/recordings/${file.filename}`

      // Update workshop with recording URL and set status to ENDED
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
        return NextResponse.json({ success: false }, { status: 500 })
      }

      console.log(`Workshop ${workshopId} recording completed: ${recordingUrl}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

