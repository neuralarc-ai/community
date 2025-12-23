import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/mail'; // Adjust the import path if necessary
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

export async function POST(request: Request) {
  try {
    const { conclaveId } = await request.json();

    if (!conclaveId) {
      const response = NextResponse.json({ message: 'conclaveId is required' }, { status: 400 });
      return setCorsHeaders(request, response);
    }

    // --- Placeholder for fetching conclave details and registered users ---
    // You'll need to replace this with your actual database logic.
    // Example:
    // const conclave = await db.getConclaveById(conclaveId);
    // if (!conclave) {
    //   return NextResponse.json({ message: 'Conclave not found' }, { status: 404 });
    // }
    // const registeredUsers = await db.getRegisteredUsersForConclave(conclaveId);

    // Mock Data for demonstration
    const conclave = {
      id: conclaveId,
      title: 'Awesome Conclave Session',
      date: 'December 25, 2025 at 10:00 AM UTC',
      link: `https://your-app.com/conclaves/${conclaveId}`,
    };
    const registeredUsers = [
      { email: 'user1@example.com', name: 'User One' },
      { email: 'user2@example.com', name: 'User Two' },
      // ... more users
    ];
    // --- End Placeholder ---

    if (!registeredUsers || registeredUsers.length === 0) {
      let notFoundResponse: NextResponse<any> = NextResponse.json({ message: 'No registered users found for this conclave' }, { status: 404 });      notFoundResponse = setCorsHeaders(request, notFoundResponse);
      return notFoundResponse;
    }

    const emailPromises = registeredUsers.map(async (user) => {
      const emailHtml = `
        <div style="font-family: 'Manrope', sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #e6b31c;">You're Invited to a Conclave!</h2>
            <p>Dear ${user.name || 'Participant'},</p>
            <p>You're invited to join our upcoming Conclave session:</p>
            <h3 style="color: #e6b31c;">${conclave.title}</h3>
            <p><strong>Date:</strong> ${conclave.date}</p>
            <p>Click the button below to join the conclave:</p>
            <a href="${conclave.link}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #e6b31c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Now</a>
            <p style="margin-top: 20px;">We look forward to seeing you there!</p>
            <p>Best regards,<br>${process.env.SENDER_NAME || 'The Community Portal Team'}</p>
          </div>
        </div>
      `;

      return sendEmail({
        to: user.email,
        subject: `Invitation: ${conclave.title}`,
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

    const successResponse = NextResponse.json({ message: 'Conclave invitations sent successfully!' }, { status: 200 });
    return setCorsHeaders(request, successResponse);

  } catch (error) {
    console.error('Error sending conclave invitations:', error);
    const errorResponse = NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}