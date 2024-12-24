import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/ApiResponse';
import VerificationEmail from "@/emails/VerificationEmail";
import { render } from '@react-email/components';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Create a transporter object using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    // Render the VerificationEmail component to HTML
    const emailHtml = await render(<VerificationEmail username={username} otp={verifyCode} />);
    const emailText = await render(<VerificationEmail username={username} otp={verifyCode} />,{
        plainText:true
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'SilentEcho Verification Code',
      text: emailText,
      html: emailHtml, 
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
