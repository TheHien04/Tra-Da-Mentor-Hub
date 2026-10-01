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
import { recordAudit } from '../services/auditStore.js';
import { getMentorById } from '../services/mentorStore.js';
import { getMenteeById } from '../services/menteeStore.js';

const router = express.Router();

const MENTOR_LOG_FIELDS = ['mentorScore', 'mentorNeedsSupport', 'mentorSupportReason', 'completedByMentor'];
const MENTEE_LOG_FIELDS = ['menteeScore', 'menteeNeedsSupport', 'menteeSupportReason', 'completedByMentee'];
const FUTURE_LIMIT_MS = 36 * 60 * 60 * 1000;

function canReadLogs(actor) {
  return actor?.isAdmin || actor?.role === 'mentor' || actor?.role === 'mentee';
}

function fieldsForActor(actor) {
  const keys = [];
  if (actor?.isAdmin || actor?.role === 'mentor') keys.push(...MENTOR_LOG_FIELDS);
  if (actor?.isAdmin || actor?.role === 'mentee') keys.push(...MENTEE_LOG_FIELDS);
  return keys;
}

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!canReadLogs(actor)) return fail(res, 403, 'FORBIDDEN');
    let { mentorId, menteeId } = req.query;
    if (actor.role === 'mentor' && !actor.isAdmin) mentorId = actor.mentorId || '__none__';
    if (actor.role === 'mentee' && !actor.isAdmin) menteeId = actor.menteeId || '__none__';
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
    if (!mentorId || !menteeId || !sessionDate || !String(topic || '').trim()) {
      return fail(res, 400, 'VALIDATION', 'mentorId, menteeId, sessionDate, topic are required');
    }
    if (!canReadLogs(actor)) return fail(res, 403, 'FORBIDDEN');
    if (!actor.isAdmin) {
      const mentorOwns = actor.role === 'mentor' && actor.mentorId === mentorId;
      const menteeOwns = actor.role === 'mentee' && actor.menteeId === menteeId;
      if (!mentorOwns && !menteeOwns) return fail(res, 403, 'FORBIDDEN');
    }

    const when = new Date(sessionDate);
    if (Number.isNaN(when.getTime()) || when.getTime() > Date.now() + FUTURE_LIMIT_MS) {
      return fail(res, 400, 'VALIDATION', 'sessionDate must be a real date, at most a day ahead');
    }

    const payload = { mentorId, menteeId, sessionDate, topic: String(topic).trim().slice(0, 200) };
    for (const key of fieldsForActor(actor)) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    const { log, created } = await upsertSessionLog(payload);

    if (created) {
      const [mentor, mentee] = await Promise.all([
        getMentorById(mentorId),
        getMenteeById(menteeId),
      ]);
      const targets =
        actor.role === 'mentor' ? [mentee] : actor.role === 'mentee' ? [mentor] : [mentor, mentee];
      const io = req.app.get('io');
      for (const profile of targets) {
        if (!profile?.userId) continue;
        await createNotification(
          {
            userId: profile.userId,
            title: 'Session log',
            message: 'A session log was recorded',
            type: 'success',
            href: '/session-logs',
          },
          io
        );
      }
      await recordAudit(req, { action: 'sessionLog.create', entity: 'sessionLog', entityId: log._id });
      return res.status(201).json(log);
    }

    await recordAudit(req, { action: 'sessionLog.update', entity: 'sessionLog', entityId: log._id });
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
