import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/security.js';
import { createNotification } from '../services/notificationStore.js';
import { listMentors } from '../services/mentorStore.js';
import { listMentees } from '../services/menteeStore.js';
import { sendBroadcastEmail } from '../utils/emailService.js';
import { sendZaloBroadcast, getZaloRecipientIdsForAudience } from '../utils/zaloService.js';
import logger from '../config/logger.js';

const router = express.Router();

router.use(authenticate, authorize('admin'), adminLimiter);

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
    const { audience = 'all', subject, message, channel = 'both' } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

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
        meta: { channel, audience },
      },
      io
    );

    let emailResult = null;
    let zaloResult = null;
    const [mentors, mentees] = await Promise.all([listMentors(), listMentees()]);

    if (channel === 'email' || channel === 'both') {
      const emails = collectEmails(audience, mentors, mentees);
      emailResult = await sendBroadcastEmail({
        emails,
        subject: title,
        message: message.trim(),
      });
    }

    if (channel === 'zalo' || channel === 'both') {
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
        email: emailResult,
        zalo: zaloResult,
        channel,
      },
    });
  } catch (e) {
    logger.error('Broadcast failed', e);
    next(e);
  }
});

export default router;
