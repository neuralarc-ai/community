import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/mail'; // Adjust the import path if necessary
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

export async function POST(request: Request) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      const response = NextResponse.json({ message: 'postId is required' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    // --- Placeholder for fetching post details and all/subscribed users ---
    // You'll need to replace this with your actual database logic.
    // Example:
    // const post = await db.getPostById(postId);
    // if (!post) {
    //   return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    // }
    // const usersToNotify = await db.getAllUsersForPostNotifications(); // Or subscribed users

    // Mock Data for demonstration
    const post = {
      id: postId,
      title: 'Important Announcement: New Feature Release!',
      content: 'We are excited to announce a new feature that will enhance your experience...',
      link: `https://your-app.com/posts/${postId}`,
    };
    const usersToNotify = [
      { email: 'sanket.pimprikar@neuralarc.ai', name: 'All User One' },
      { email: 'alluser2@example.com', name: 'All User Two' },
      // ... more users
    ];
    // --- End Placeholder ---

    if (!usersToNotify || usersToNotify.length === 0) {
      // Add ": NextResponse<any>" here to relax the type checking
      let notFoundResponse: NextResponse<any> = NextResponse.json(
        { message: 'No users to notify for this post' }, 
        { status: 404 }
      );
      
      notFoundResponse = setCorsHeaders(request, notFoundResponse);
      return notFoundResponse;
    }

    const emailPromises = usersToNotify.map(async (user) => {
      const emailHtml = `
        <div style="font-family: 'Manrope', sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #e6b31c;">New Post: ${post.title}</h2>
            <p>Dear ${user.name || 'Community Member'},</p>
            <p>An important announcement has been published:</p>
            <h3 style="color: #e6b31c;">${post.title}</h3>
            <p>${post.content.substring(0, 150)}...</p>
            <p>Click the button below to read the full post:</p>
            <a href="${post.link}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #e6b31c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Post</a>
            <p style="margin-top: 20px;">Stay tuned for more updates!</p>
            <p>Best regards,<br>${process.env.SENDER_NAME || 'The Community Portal Team'}</p>
          </div>
        </div>
      `;

      return sendEmail({
        to: user.email,
        subject: `New Announcement: ${post.title}`,
        html: emailHtml,
      });
    });

    const results = await Promise.all(emailPromises);
    const failures = results.filter(result => !result.success);

    if (failures.length > 0) {
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