import * as React from 'react';

interface ConclaveInvitationEmailProps {
  userName: string;
  conclaveTitle: string;
  conclaveDate: string;
  conclaveTime: string;
  conclaveLink: string;
  hostName: string;
  conclaveDescription: string;
}

export const ConclaveInvitationEmail = ({
  userName,
  conclaveTitle,
  conclaveDate,
  conclaveTime,
  conclaveLink,
  hostName,
  conclaveDescription,
}: ConclaveInvitationEmailProps) => {
  const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://sphere.he2.ai';
  const logoImgSrc = `${siteUrl}/${encodeURIComponent('HeliumLogo_dark (2).png')}`;
  const bgImageStyle = `background-image:url('${siteUrl}/${encodeURIComponent('Group 1000002848.svg')}');background-repeat:repeat;background-position:top center;`;

  const formattedDate = new Date(conclaveDate).toLocaleDateString();
  const formattedTime = new Date(conclaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
                  <img src="${logoImgSrc}" width="56" height="57" style="display:block;width:56px;height:auto;max-width:56px;margin:0 auto;" alt="Helium Logo">
                </td>
              </tr>

              <!-- Main Heading: Conclave Invitation: [Conclave Title] -->
              <tr>
                <td align="center" style="font-family: Arial, Helvetica, sans-serif; font-size: 28px; line-height: 1.3; color: #333333; font-weight: 700; padding-bottom: 20px;" class="heading-text">
                  Conclave Invitation: <span style="color: #27584F;">${conclaveTitle}</span>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; padding-bottom: 10px;" class="paragraph-text">
                  Hi ${userName},
                </td>
              </tr>

              <!-- Intro Sentence -->
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; padding-bottom: 20px;" class="paragraph-text">
                  You're invited to a conclave hosted by ${hostName}!
                </td>
              </tr>

              <!-- Accent Highlight Card (Conclave Details) -->
              <tr>
                <td style="padding-bottom: 30px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e0f2f1; border-radius: 8px; padding: 20px;">
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; line-height: 1.4; color: #27584F; font-weight: 700; padding-bottom: 10px;">
                        Conclave: ${conclaveTitle}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #555555;">
                        Description: ${conclaveDescription}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #555555;">
                        Date: ${formattedDate}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #555555;">
                        Time: ${formattedTime}
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
                        <a href="${conclaveLink}" target="_blank" style="background: #27584F; border: 15px solid #27584F; padding: 0 10px; color: #ffffff; text-decoration: none; border-radius: 25px; display: inline-block; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold;">
                          Join Conclave
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Closing and Team Helium -->
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333;" class="paragraph-text">
                  We look forward to seeing you there.
                </td>
              </tr>
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; padding-top: 10px;" class="paragraph-text">
                  Best regards,<br>The Sphere Community Portal Team
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
            © 2025 Sphere Community Portal. All rights reserved.
          </td>
        </tr>
      </table>
    </td>fter raising 
  </tr>
</table>

</body>
</html>`;
};
