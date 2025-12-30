import nodemailer from 'nodemailer';

// Ensure environment variables are loaded (Next.js handles this automatically for .env files)
// For standalone scripts or if not using Next.js, you might need require('dotenv').config();

const port = parseInt(process.env.SMTP_PORT || '587', 10);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: port === 465, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to?: string;
  bcc?: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, bcc, subject, html }: EmailOptions) {
  if (!process.env.SENDER_EMAIL || !process.env.SENDER_NAME) {
    console.error("SENDER_EMAIL or SENDER_NAME environment variables are not set.");
    throw new Error("Email sender configuration is missing.");
  }

  const mailOptions = {
    from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
    to,
    bcc,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return { success: false, error: (error as Error).message };
  }
}
