import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/mail'; // Adjust the import path if necessary
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';
import { createServerClient } from '@/app/lib/supabaseServerClient';

export async function POST(request: Request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      const response = NextResponse.json({ message: 'postId is required' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    const supabase = await createServerClient();

    // Fetch the post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, body, created_at')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      const response = NextResponse.json({ message: 'Post not found' }, { status: 404 });
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
      const postLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-app.com'}/posts/${postId}`;
      const emailHtml = `
        <div style="font-family: 'Manrope', sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #e6b31c;">New Post: ${post.title}</h2>
            <p>Dear ${user.name},</p>
            <p>A new post has been published in the community:</p>
            <h3 style="color: #e6b31c;">${post.title}</h3>
            <p>${post.body.substring(0, 200)}${post.body.length > 200 ? '...' : ''}</p>
            <p>Click the button below to read the full post:</p>
            <a href="${postLink}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #e6b31c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Post</a>
            <p style="margin-top: 20px;">Stay tuned for more updates!</p>
            <p>Best regards,<br>${process.env.SENDER_NAME || 'The Community Portal Team'}</p>
          </div>
        </div>
      `;

      return sendEmail({
        to: user.email,
        subject: `New Community Post: ${post.title}`,
        html: emailHtml,
      });
    });

    const results = await Promise.allSettled(emailPromises);

    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (failures.length > 0) {
      console.error('Failed to send some emails:', failures);
      const errorResponse = NextResponse.json(
        { message: `${failures.length} emails failed to send.`, details: failures },
        { status: 500 }
      );
      return setCorsHeaders(request, errorResponse);
    }

    const successResponse = NextResponse.json({ message: 'Post announcement emails sent successfully!' }, { status: 200 });
    return setCorsHeaders(request, successResponse);

  } catch (error) {
    console.error('Error sending post announcement emails:', error);
    const errorResponse = NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}