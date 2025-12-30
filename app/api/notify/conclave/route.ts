import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { sendEmail } from '@/app/lib/mail';
import { ConclaveInvitationEmail } from '@/app/emails/ConclaveInvitationEmail';
import { render } from '@react-email/render';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';
import { Workshop } from '@/app/types';

export async function POST(req: NextRequest) {
  // Initialize supabase client with anonymous key for general operations
  const supabase = await createServerClient();
  // Initialize supabase client with service role key for fetching all profiles (bypassing RLS)
  const supabaseServiceRole = await createServerClient(true);

  try {
    const { workshopId } = await req.json();

    if (!workshopId) {
      const response = NextResponse.json({ message: 'Workshop ID is required' }, { status: 400 });
      return setCorsHeaders(req, response);
    }

    // Fetch workshop details
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, description, start_time, host_id')
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      console.error('Error fetching workshop:', workshopError);
      const response = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return setCorsHeaders(req, response);
    }

    // {{ Start of removal of host profile changes }}
    // The host profile fetching logic is removed as per user's request.
    // If hostName is still required in the email, it will default to 'Host'
    const hostName = 'Host';
    // {{ End of removal of host profile changes }}

    // 1. Fetch all user profiles with their emails
    const { data: allProfiles, error: profilesError } = await supabaseServiceRole
      .from('profiles')
      .select('id, email'); // Assuming 'id' in profiles is the same as 'auth.users.id'

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      const response = NextResponse.json({ message: 'Failed to fetch user profiles' }, { status: 500 });
      return setCorsHeaders(req, response);
    }

    if (!allProfiles || allProfiles.length === 0) {
      const response = NextResponse.json({ message: 'No user profiles found to notify' }, { status: 200 });
      return setCorsHeaders(req, response);
    }

    // 2. Filter out emails ending with "@neuralarc.ai" and exclude host email
    const emailsToSend = allProfiles
      .filter(profile => {
        const isNeuralArcEmail = profile.email?.endsWith('@neuralarc.ai');
        const isHostEmail = profile.id === workshop.host_id;
        return !isNeuralArcEmail && !isHostEmail && profile.email; // Ensure email exists
      })
      .map(profile => profile.email as string); // Extract only emails for BCC

    if (emailsToSend.length === 0) {
      const response = NextResponse.json({ message: 'No eligible users to notify after filtering' }, { status: 200 });
      return setCorsHeaders(req, response);
    }

    // Send emails using BCC
    await sendEmail({
      to: undefined, // Explicitly set 'to' to undefined
      bcc: emailsToSend, // Pass the array directly to bcc
      subject: `Conclave Live: ${workshop.title}`,
      html: await render(ConclaveInvitationEmail({
        userName: 'Attendee', // We are not fetching individual names for BCC emails
        conclaveTitle: workshop.title,
        conclaveDate: workshop.start_time,
        conclaveTime: workshop.start_time,
        conclaveLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/conclave/${workshop.id}`,
        hostName: hostName,
        conclaveDescription: workshop.description,
      })),
    });

    const successResponse = NextResponse.json({ message: 'Conclave invitation emails sent successfully!' }, { status: 200 });
    return setCorsHeaders(req, successResponse);
  } catch (error) {
    console.error('Error notifying conclave users:', error);
    const errorResponse = NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    return setCorsHeaders(req, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
