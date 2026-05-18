import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/security.js';
import { createNotification, listBroadcastNotifications } from '../services/notificationStore.js';
import { listMentors } from '../services/mentorStore.js';
import { listMentees } from '../services/menteeStore.js';
import { sendBroadcastEmail } from '../utils/emailService.js';
import { sendZaloBroadcast, getZaloRecipientIdsForAudience } from '../utils/zaloService.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

const router = express.Router();

router.use(authenticate, authorize('admin'), adminLimiter);

/** GET /api/admin/broadcasts — recent admin broadcast notifications */
router.get('/broadcasts', async (_req, res, next) => {
  try {
    const data = await listBroadcastNotifications(30);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/** GET /api/admin/integrations — feature flags for admin UI (no secrets) */
router.get('/integrations', (_req, res) => {
  const zaloRecipients = getZaloRecipientIdsForAudience('all').length;
  const emailConfigured = Boolean(env.sendgridApiKey);
  const zaloToken = Boolean(env.zaloOaAccessToken);
  res.json({
    success: true,
    data: {
      inApp: true,
      email: emailConfigured,
      zalo: zaloToken && zaloRecipients > 0,
      zaloToken,
      zaloRecipients,
      googleCalendar: Boolean(env.googleClientId && env.googleClientSecret),
      openai: Boolean(env.openaiApiKey),
      stripe: Boolean(env.stripeSecretKey),
      channels: {
        inApp: { ready: true, envVars: [] },
        email: {
          ready: emailConfigured,
          envVars: ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL'],
        },
        zalo: {
          ready: zaloToken && zaloRecipients > 0,
          envVars: ['ZALO_OA_ACCESS_TOKEN', 'ZALO_BROADCAST_USER_IDS'],
          needsRecipients: zaloToken && zaloRecipients === 0,
        },
      },
    },
  });
});

function collectEmails(audience, mentors, mentees) {
  if (audience === 'mentors') return mentors.map((m) => m.email).filter(Boolean);
  if (audience === 'mentees') return mentees.map((m) => m.email).filter(Boolean);
  return [
    ...mentors.map((m) => m.email),
    ...mentees.map((m) => m.email),
  ].filter(Boolean);
}

/**
 * POST /api/admin/broadcast
 * body: { audience: 'all'|'mentors'|'mentees', subject?, message, channel? }
 */
router.post('/broadcast', async (req, res, next) => {
  try {
    const { audience = 'all', subject, message, channel = 'in_app' } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const normalizedChannel =
      channel === 'both' ? 'email_zalo' : channel === 'all' ? 'email_zalo' : channel;

    const io = req.app.get('io');
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
      io
    );

    let emailResult = null;
    let zaloResult = null;
    const [mentors, mentees] = await Promise.all([listMentors(), listMentees()]);

    const wantsEmail =
      normalizedChannel === 'email' || normalizedChannel === 'email_zalo';
    const wantsZalo =
      normalizedChannel === 'zalo' || normalizedChannel === 'email_zalo';

    if (wantsEmail) {
      const emails = collectEmails(audience, mentors, mentees);
      emailResult = await sendBroadcastEmail({
        emails,
        subject: title,
        message: message.trim(),
      });
    }

    if (wantsZalo) {
      const recipientIds = getZaloRecipientIdsForAudience(audience);
      zaloResult = await sendZaloBroadcast({
        message: message.trim(),
        recipientIds,
      });
    }

    res.json({
      success: true,
      data: {
        notification,
        delivery: {
          inApp: true,
          email: emailResult,
          zalo: zaloResult,
        },
        channel: normalizedChannel,
      },
    });
  } catch (e) {
    logger.error('Broadcast failed', e);
    next(e);
  }
});

export default router;
