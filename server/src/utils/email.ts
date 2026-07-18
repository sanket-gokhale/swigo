import { BrevoClient } from '@getbrevo/brevo';
import { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from '../config/env';

export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured in environment variables.');
  }

  const brevo = new BrevoClient({ apiKey: BREVO_API_KEY });

  const senderEmail = BREVO_SENDER_EMAIL;
  const senderName = BREVO_SENDER_NAME;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; width: 40px; height: 40px; background-color: #FF5A5F; border-radius: 8px; vertical-align: middle; margin-right: 10px;"></div>
        <span style="font-size: 24px; font-weight: bold; color: #18181b; vertical-align: middle;">Swigo</span>
      </div>
      <h2 style="color: #FF5A5F; text-align: center; margin-bottom: 20px;">Password Reset Token</h2>
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your Swigo account. Please copy and paste the following reset token into the password reset page to complete your request:</p>
      <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #18181b; border-radius: 8px; margin: 25px auto; max-width: 300px; border: 1px solid #e4e4e7;">
        ${token}
      </div>
      <p style="color: #3f3f46; font-size: 14px; line-height: 1.5;">This token is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email and your password will remain secure.</p>
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 25px 0;" />
      <p style="font-size: 12px; color: #71717a; text-align: center; margin: 0;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  `;

  await brevo.transactionalEmails.sendTransacEmail({
    subject: 'Swigo - Password Reset Request',
    htmlContent: htmlContent,
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    textContent: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please use the following reset token to reset your password:\n\n` +
      `${token}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`
  });
};
