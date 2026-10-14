const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail(toEmail, resetUrl) {
  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your FutureEra password',
    html: `
      <div style="font-family: sans-serif; background: #05010F; color: #F1EFFF; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #8A5CFF; margin-top: 0;">Reset your password</h2>
        <p style="color: #F1EFFF; line-height: 1.6;">
          We received a request to reset your FutureEra password. Click the button below to choose a new one.
          This link expires in 30 minutes.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #8A5CFF; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Reset password
        </a>
        <p style="color: #7C7A99; font-size: 13px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email — your password will not change.
        </p>
        <p style="color: #7C7A99; font-size: 12px; margin-top: 24px;">
          If the button doesn't work, copy and paste this link: <br/>
          <span style="word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail };
