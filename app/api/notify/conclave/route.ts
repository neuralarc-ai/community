// app/api/notify/conclave/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/mail';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';
import { createServerClient } from '@/app/lib/supabaseServerClient';

export async function POST(request: NextRequest) {
  try {
    const { workshopId } = await request.json();

    if (!workshopId) {
      const response = NextResponse.json({ message: 'workshopId is required' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    const supabase = await createServerClient();

    // Fetch workshop details
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, description, created_at') // Adjust fields as needed
      .eq('id', workshopId)
      .single();

    if (workshopError || !workshop) {
      console.error('Error fetching workshop:', workshopError);
      const response = NextResponse.json({ message: 'Workshop not found' }, { status: 404 });
      return setCorsHeaders(request, response);
    }

    // Fetch profiles from YOUR profiles table (now including the 'email' column)
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('email, full_name'); // Select email and full_name from your profiles table

    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      const response = NextResponse.json({ message: 'Error fetching user profiles' }, { status: 500 });
      return setCorsHeaders(request, response);
    }

    // Filter out emails ending with "@neuralarc.ai"
    const usersToNotify = profiles
      .filter(profile => profile.email && !profile.email.endsWith('@neuralarc.ai'))
      .map(profile => ({
        email: profile.email as string,
        name: profile.full_name || 'Community Member',
      }));

    if (!usersToNotify || usersToNotify.length === 0) {
      const response = NextResponse.json(
        { message: 'No eligible users to notify.' },
        { status: 200 }
      );
      return setCorsHeaders(request, response);
    }

    const emailPromises = usersToNotify.map(async (user) => {
      const workshopLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-app.com'}/workshops/${workshopId}/live`;
      const emailHtml = `
        <div style="font-family: 'Manrope', sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #e6b31c;">Live Conclave: ${workshop.title}</h2>
            <p>Dear ${user.name},</p>
            <p>A new conclave is live now:</p>
            <h3 style="color: #e6b31c;">${workshop.title}</h3>
            <p>${workshop.description ? workshop.description.substring(0, 200) + (workshop.description.length > 200 ? '...' : '') : 'No description available.'}</p>
            <p>Join the live session now!</p>
            <a href="${workshopLink}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #e6b31c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Conclave</a>
            <p style="margin-top: 20px;">Don't miss out!</p>
            <p>Best regards,<br>${process.env.SENDER_NAME || 'The Community Portal Team'}</p>
          </div>
        </div>
      `;

      return sendEmail({
        to: user.email,
        subject: `Live Conclave Alert: ${workshop.title}`,
        html: emailHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (failures.length > 0) {
      console.error('Failed to send some conclave notification emails:', failures);
      const errorResponse = NextResponse.json(
        { message: `${failures.length} conclave notification emails failed to send.`, details: failures },
        { status: 500 }
      );
      return setCorsHeaders(request, errorResponse);
    }

    const successResponse = NextResponse.json({ message: 'Conclave notification emails sent successfully!' }, { status: 200 });
    return setCorsHeaders(request, successResponse);

  } catch (error) {
    console.error('Error sending conclave notification emails:', error);
    const errorResponse = NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}