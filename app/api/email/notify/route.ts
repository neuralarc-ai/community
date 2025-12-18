import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/app/lib/supabaseServerClient'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { workshopId } = await request.json()
    
    if (!workshopId) {
      return NextResponse.json(
        { error: 'Missing workshopId' },
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

    // Verify user is the host and workshop is LIVE
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id, title, status')
      .eq('id', workshopId)
      .eq('host_id', user.id)
      .eq('status', 'LIVE')
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found, user is not host, or workshop is not LIVE' },
        { status: 403 }
      )
    }

    // Get all waitlist emails that haven't been notified
    const { data: waitlist, error: waitlistError } = await supabase
      .from('workshop_waitlist')
      .select('user_email')
      .eq('workshop_id', workshopId)
      .eq('notified', false)

    if (waitlistError) {
      console.error('Error fetching waitlist:', waitlistError)
      return NextResponse.json(
        { error: 'Failed to fetch waitlist' },
        { status: 500 }
      )
    }

    if (!waitlist || waitlist.length === 0) {
      return NextResponse.json({ message: 'No users to notify' })
    }

    // Send emails to all waitlist users
    const emailPromises = waitlist.map(async (entry) => {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev', // Default testing domain
          to: entry.user_email,
          subject: `🎙️ ${workshop.title} is now LIVE!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>🎙️ Conclave is Live!</h2>
              <p><strong>${workshop.title}</strong> has just started!</p>
              <p>Join now: <a href="${process.env.NEXT_PUBLIC_APP_URL}/workshops/${workshopId}">Click here to join</a></p>
              <p>Don't miss out on the live session.</p>
              <br>
              <p>Best regards,<br>Your Community Team</p>
            </div>
          `,
        })
        return entry.user_email
      } catch (error) {
        console.error(`Failed to send email to ${entry.user_email}:`, error)
        return null
      }
    })

    const sentEmails = (await Promise.all(emailPromises)).filter(Boolean) as string[]

    // Mark notified users as notified
    if (sentEmails.length > 0) {
      const { error: updateError } = await supabase
        .from('workshop_waitlist')
        .update({ notified: true })
        .eq('workshop_id', workshopId)
        .in('user_email', sentEmails)

      if (updateError) {
        console.error('Error updating notification status:', updateError)
      }
    }

    return NextResponse.json({
      message: `Notifications sent to ${sentEmails.length} users`,
      sentCount: sentEmails.length,
    })

  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

