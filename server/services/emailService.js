const nodemailer = require('nodemailer');
const env = require('../config/env');

const createTransporter = () => {
  if (!env.EMAIL_HOST || !env.EMAIL_USER) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    secure: Number(env.EMAIL_PORT) === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`📧 [DEV] Password reset email for ${email}:`);
    console.log(`   Reset URL: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: `"FutureEra" <${env.EMAIL_FROM}>`,
    to: email,
    subject: 'FutureEra — Password Reset',
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#8A5CFF;">FutureEra</h2>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#8A5CFF;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">Reset Password</a>
      <p style="font-size:13px;color:#666;">This link expires in 30 minutes. If you did not request this, please ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="font-size:11px;color:#999;">FutureEra — AI Career Path Simulator</p>
    </div>`,
  });
};
