/**
 * Session Log API – CRM sau mỗi buổi mentoring
 */

import express from 'express';
import { authorize } from '../middleware/auth.js';
import { createNotification } from '../services/notificationStore.js';
import {
  listSessionLogs,
  upsertSessionLog,
  listNeedsSupport,
} from '../services/sessionLogStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    let { mentorId, menteeId } = req.query;
    if (actor?.role === 'mentor' && !actor.isAdmin) mentorId = actor.mentorId || '__none__';
    if (actor?.role === 'mentee' && !actor.isAdmin) menteeId = actor.menteeId || '__none__';
    const list = await listSessionLogs({ mentorId, menteeId });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const { mentorId, menteeId, sessionDate, topic } = req.body;
    if (!mentorId || !menteeId || !sessionDate || !topic) {
      return fail(res, 400, 'VALIDATION', 'mentorId, menteeId, sessionDate, topic are required');
    }
    if (!actor?.isAdmin) {
      const mentorOwns = actor?.role === 'mentor' && actor.mentorId === mentorId;
      const menteeOwns = actor?.role === 'mentee' && actor.menteeId === menteeId;
      if (!mentorOwns && !menteeOwns) return fail(res, 403, 'FORBIDDEN');
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
