/**
 * Session Log API – CRM sau mỗi buổi mentoring
 */

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createNotification } from '../services/notificationStore.js';
import {
  listSessionLogs,
  upsertSessionLog,
  listNeedsSupport,
} from '../services/sessionLogStore.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { mentorId, menteeId } = req.query;
    const list = await listSessionLogs({ mentorId, menteeId });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { mentorId, menteeId, sessionDate, topic } = req.body;
    if (!mentorId || !menteeId || !sessionDate || !topic) {
      return res.status(400).json({
        success: false,
        message: 'mentorId, menteeId, sessionDate, topic are required',
      });
    }

    const { log, created } = await upsertSessionLog(req.body);

    if (created) {
      const io = req.app.get('io');
      await createNotification(
        {
          userId: 'all',
          title: 'Session log mới',
          message: `Buổi "${topic}" đã được ghi nhận`,
          type: 'success',
          href: '/session-logs',
        },
        io
      );
      return res.status(201).json(log);
    }

    res.json(log);
  } catch (e) {
    next(e);
  }
});

router.get('/needs-support', authorize('admin'), async (req, res, next) => {
  try {
    const list = await listNeedsSupport();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
