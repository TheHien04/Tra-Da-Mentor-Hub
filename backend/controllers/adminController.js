import env from '../config/env.js';
import logger from '../config/logger.js';
import { demoIntegrationsEnabled } from '../lib/demoIntegrations.js';
import { getRuntimeMetrics } from '../lib/runtimeMetrics.js';
import { listAudit, seedAuditIfEmpty } from '../services/auditStore.js';
import { listMentees } from '../services/menteeStore.js';
import { listMentors } from '../services/mentorStore.js';
import { createNotification, listBroadcastNotifications } from '../services/notificationStore.js';
import { sendBroadcastEmail } from '../utils/emailService.js';
import { getZaloRecipientIdsForAudience, sendZaloBroadcast } from '../utils/zaloService.js';

function collectEmails(audience, mentors, mentees) {
  if (audience === 'mentors') return mentors.map((item) => item.email).filter(Boolean);
  if (audience === 'mentees') return mentees.map((item) => item.email).filter(Boolean);
  return [...mentors.map((item) => item.email), ...mentees.map((item) => item.email)].filter(Boolean);
}

export async function getAudit(req, res, next) {
  try {
    await seedAuditIfEmpty();
    const data = await listAudit(req.query.limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getBroadcasts(_req, res, next) {
  try {
    const data = await listBroadcastNotifications(30);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export function getIntegrations(_req, res) {
  const demo = demoIntegrationsEnabled();
  const zaloRecipients = getZaloRecipientIdsForAudience('all').length;
  const emailConfigured = Boolean(env.sendgridApiKey);
  const zaloToken = Boolean(env.zaloOaAccessToken);
  const emailReady = emailConfigured;
  const zaloReady = zaloToken && zaloRecipients > 0;

  res.json({
    success: true,
    data: {
      inApp: true,
      demo,
      email: emailReady,
      zalo: zaloReady,
      zaloToken,
      zaloRecipients,
      googleCalendar: Boolean(env.googleClientId && env.googleClientSecret),
      openai: Boolean(env.openaiApiKey),
      stripe:
        Boolean(
          env.paidPlansEnabled &&
          env.stripeSecretKey &&
          env.stripeWebhookSecret &&
          env.stripeProPriceId &&
          env.stripePremiumPriceId
        ),
      channels: {
        inApp: { ready: true, envVars: [] },
        email: { ready: emailReady, envVars: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'] },
        zalo: {
          ready: zaloReady,
          envVars: ['ZALO_OA_ACCESS_TOKEN', 'ZALO_BROADCAST_USER_IDS'],
          needsRecipients: zaloToken && zaloRecipients === 0,
        },
      },
    },
  });
}

export function getMetrics(_req, res) {
  res.json({ success: true, data: getRuntimeMetrics() });
}

export async function sendBroadcast(req, res, next) {
  try {
    const { audience = 'all', subject, message, channel = 'in_app' } = req.body;
    const normalizedChannel = ['both', 'all'].includes(channel) ? 'email_zalo' : channel;
    const title = subject?.trim() || 'Trà Đá Mentor';
    const userId = audience === 'mentors' || audience === 'mentees' ? audience : 'all';

    const notification = await createNotification(
      {
        userId,
        title,
        message: message.trim(),
        type: 'info',
        href: '/',
        meta: { channel: normalizedChannel, audience },
      },
      req.app.get('io')
    );

    const [mentors, mentees] = await Promise.all([listMentors(), listMentees()]);
    const wantsEmail = ['email', 'email_zalo'].includes(normalizedChannel);
    const wantsZalo = ['zalo', 'email_zalo'].includes(normalizedChannel);

    const emailResult = wantsEmail
      ? await sendBroadcastEmail({
          emails: collectEmails(audience, mentors, mentees),
          subject: title,
          message: message.trim(),
        })
      : null;
    const zaloResult = wantsZalo
      ? await sendZaloBroadcast({
          message: message.trim(),
          recipientIds: getZaloRecipientIdsForAudience(audience),
        })
      : null;

    res.json({
      success: true,
      data: {
        notification,
        delivery: { inApp: true, email: emailResult, zalo: zaloResult },
        channel: normalizedChannel,
      },
    });
  } catch (error) {
    logger.error('Broadcast failed', error);
    next(error);
  }
}
