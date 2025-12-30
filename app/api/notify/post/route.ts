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
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sphere.he2.ai';
      const postLink = `${siteUrl}/posts/${postId}`;
      const logoImg = `<img src="${siteUrl}/${encodeURIComponent('HeliumLogo_dark (2).png')}" width="56" height="57" style="display:block;width:56px;height:auto;max-width:56px;margin:0 auto;" alt="Helium Logo">`;
      const bgImageStyle = `background-image:url('${siteUrl}/${encodeURIComponent('Group 1000002848.svg')}');background-repeat:repeat;background-position:top center;`;

      const postTitleContent = post.title || "Untitled Post";
      const postExcerptContent = post.body ? post.body.substring(0, 200) + (post.body.length > 200 ? '...' : '') : "No excerpt available.";
      const greeting = `Dear ${user.name},`;
      const introSentence = `A new post has been published in the community:`;
      const closingSignoff = `Best regards,<br>${process.env.SENDER_NAME || 'The Community Portal Team'}`;
      const footerCopyright = "© 2025 Sphere Community Portal. All rights reserved.";

      const emailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="x-apple-disable-message-reformatting">
<style>
/* Mobile responsiveness styles */
@media screen and (max-width: 600px) {
  .email-container {
    width: 100% !important;
    padding: 0 !important;
  }
  .content-card-inner {
    padding: 20px !important;
  }
  .heading-text {
    font-size: 24px !important;
    line-height: 1.2 !important;
  }
  .paragraph-text {
    font-size: 14px !important;
    line-height: 1.5 !important;
  }
  .button-cell {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
</head>
<body style="width:100%;-webkit-text-size-adjust:100%;text-size-adjust:100%;background-color:#f5f5f5;margin:0;padding:0;font-family:Arial, Helvetica, sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f5f5;${bgImageStyle} padding: 40px 0;">
  <tr>
    <td align="center" style="padding: 0 10px;">
      <!-- Centered White Rounded Card -->
      <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;">
        <tr>
          <td class="content-card-inner" style="padding: 40px 30px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  ${logoImg}
                </td>
              </tr>

              <!-- Main Heading: New Post: [Post Title] -->
              <tr>
                <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 28px; line-height: 1.3; color: #333333; font-weight: 700; padding-bottom: 20px;" class="heading-text">
                  New Post: <span style="color: #27584F;">${postTitleContent}</span>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; padding-bottom: 10px;" class="paragraph-text">
                  ${greeting}
                </td>
              </tr>

              <!-- Intro Sentence -->
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; padding-bottom: 20px;" class="paragraph-text">
                  ${introSentence}
                </td>
              </tr>

              <!-- Accent Highlight Card (Post Title & Excerpt) -->
              <tr>
                <td style="padding-bottom: 30px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e0f2f1; border-radius: 8px; padding: 20px;">
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.4; color: #27584F; font-weight: 700; padding-bottom: 10px;">
                        ${postTitleContent}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #555555;">
                        ${postExcerptContent}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td align="center" class="button-cell" style="padding-bottom: 30px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td align="center" bgcolor="#27584F" style="border-radius: 25px; background: #27584F; text-align: center;">
                        <a href="${postLink}" target="_blank" style="background: #27584F; border: 15px solid #27584F; padding: 0 10px; color: #ffffff; text-decoration: none; border-radius: 25px; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold;">
                          View Post
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Closing and Team Helium -->
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;" class="paragraph-text">
                  Stay tuned for more updates!
                </td>
              </tr>
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; padding-top: 10px;" class="paragraph-text">
                  ${closingSignoff}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Footer with Copyright -->
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%;">
        <tr>
          <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5; color: #777777; padding-top: 20px;">
            ${footerCopyright}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`;

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