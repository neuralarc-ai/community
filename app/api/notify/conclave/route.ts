import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { sendEmail } from '@/app/lib/mail';
import { ConclaveInvitationEmail } from '@/app/emails/ConclaveInvitationEmail';
import ReactDOMServer from 'react-dom/server';
import { Workshop } from '@/app/types';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    const { workshopId } = await req.json();

    if (!workshopId) {
      return NextResponse.json({ message: 'Workshop ID is required' }, { status: 400 });
    }

    // Fetch workshop details
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, description, start_time, end_time, host_id, host:profiles(display_name)')
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      console.error('Error fetching workshop:', workshopError);
      return NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
    }

    // Fetch registered users (or waitlist users, depending on logic)
    // For this example, let's assume we're notifying users on a waitlist or registered users.
    // You might need to adjust this query based on your actual database schema and notification logic.
    const { data: waitlistUsers, error: waitlistError } = await supabase
      .from('workshop_waitlist')
      .select('user_email')
      .eq('workshop_id', workshopId);

    if (waitlistError) {
      console.error('Error fetching waitlist users:', waitlistError);
      return NextResponse.json({ message: 'Failed to fetch waitlist users' }, { status: 500 });
    }

    if (!waitlistUsers || waitlistUsers.length === 0) {
      return NextResponse.json({ message: 'No users to notify' }, { status: 200 });
    }

    // Send emails
    const emailsToSend = waitlistUsers.map(user => user.user_email);

    if (emailsToSend.length > 0) {
      await sendEmail({
        from: process.env.SENDER_EMAIL || 'notifications@neuralarc.ai',
        to: emailsToSend.join(','), // sendEmail expects a comma-separated string for multiple recipients
        subject: `Conclave Live: ${workshop.title}`,
        html: ReactDOMServer.renderToString(ConclaveInvitationEmail({
          userName: 'Attendee', // This might need to be dynamic if you fetch user names
          conclaveTitle: workshop.title,
          conclaveDate: workshop.start_time,
          conclaveTime: workshop.start_time,
          conclaveLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/conclave/${workshop.id}`,
          hostName: (workshop.host as { display_name: string })?.display_name || 'Host',
          conclaveDescription: workshop.description,
        })),
      });
    }

    return NextResponse.json({ message: 'Notifications sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error notifying conclave users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
