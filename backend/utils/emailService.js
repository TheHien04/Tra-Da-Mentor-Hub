// backend/utils/emailService.js
/**
 * Email Service using SendGrid
 * Handles all email sending functionality
 */

import sgMail from '@sendgrid/mail';
import logger from '../config/logger.js';
import env from '../config/env.js';

// Initialize SendGrid
if (env.sendgridApiKey) {
  sgMail.setApiKey(env.sendgridApiKey);
} else {
  logger.warn('SendGrid API key not configured. Email sending will be disabled.');
}

const FROM_EMAIL = env.sendgridFromEmail || 'noreply@tradamentor.com';
const FROM_NAME = env.sendgridFromName || 'Trà Đá Mentor';
const FRONTEND_URL = env.frontendUrl || 'http://localhost:5173';

/**
 * Send email helper
 */
async function sendEmail({ to, subject, text, html }) {
  if (!env.sendgridApiKey) {
    logger.warn(`Email sending disabled - Would send to ${to}: ${subject}`);
    return { success: false, message: 'Email service not configured' };
  }

  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    logger.info(`Email sent successfully to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
}

/**
 * Email Templates
 */

export async function sendWelcomeEmail(user, verificationToken) {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const subject = `Welcome to ${FROM_NAME}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Trà Đá Mentor!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Thank you for joining Trà Đá Mentor! We're excited to have you as part of our mentoring community.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p><small>This link will expire في24 hours.</small></p>
          <hr>
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Complete your profile</li>
            <li>Browse mentors in your track</li>
            <li>Schedule your first session</li>
          </ul>
        </div>
        <div class="footer">
          <p>&copy; 2026 Trà Đá Mentor. All rights reserved.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Welcome to ${FROM_NAME}, ${user.name}!\n\nPlease verify your email: ${verificationUrl}\n\nThis link expires in 24 hours.`;

  return sendEmail({ to: user.email, subject, text, html });
}

export async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link:</p>
          <p style="word-break: break-all; color: #f44336;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link expires in <strong>1 hour</strong></li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password won't change until you create a new one</li>
            </ul>
          </div>
        </div>
        <div class="footer" style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>&copy; 2026 Trà Đá Mentor. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Password Reset Request\n\nHi ${user.name},\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`;

  return sendEmail({ to: user.email, subject, text, html });
}

export async function sendSessionReminderEmail(user, session) {
  const subject = `Session Reminder - Tomorrow at ${session.time}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📅 Session Reminder</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Don't forget your upcoming mentoring session!</p>
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${session.topic}</h3>
            <p><strong>🕐 Time:</strong> ${session.time}</p>
            <p><strong>👤 With:</strong> ${session.with}</p>
            ${session.meetLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${session.meetLink}">${session.meetLink}</a></p>` : ''}
          </div>
          <p>See you there! 🎯</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: user.email, subject, text: subject, html });
}

export async function sendEmailVerification(user, verificationToken) {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const subject = 'Verify Your Email Address';
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2196f3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>✉️ Verify Your Email</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Please verify your email address to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 30px; background: #2196f3; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          </div>
          <p style="font-size: 12px; color: #666;">Link expires in 24 hours</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: user.email, subject, text: `Verify your email: ${verificationUrl}`, html });
}

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSessionReminderEmail,
  sendEmailVerification,
};
