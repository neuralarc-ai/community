import { NextRequest, NextResponse } from 'next/server'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'
import { sendEmail } from '@/app/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, subject, htmlContent } = await request.json()

    if (!recipientEmail || !subject || !htmlContent) {
      const response = NextResponse.json(
        { error: 'Missing recipientEmail, subject, or htmlContent' },
        { status: 400 }
      );
      return setCorsHeaders(request, response);
    }

    try {
      await sendEmail({
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      });

      const finalResponse = NextResponse.json({
        message: `Notification sent to ${recipientEmail}`,
      });
      return setCorsHeaders(request, finalResponse);
    } catch (emailError) {
      console.error(`Failed to send email to ${recipientEmail}:`, emailError);
      const errorResponse = NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
      return setCorsHeaders(request, errorResponse);
    }

  } catch (error) {
    console.error('Error sending notifications:', error)
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
