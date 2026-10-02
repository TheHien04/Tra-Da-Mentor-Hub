import express from 'express';
import {
  listNotificationsForActor,
  markRead,
  markAllRead,
  createNotification,
} from '../services/notificationStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';

const router = express.Router();

function audienceIds(actor) {
  const ids = ['all', actor.userId];
  if (actor.role === 'mentor' || actor.isAdmin) ids.push('mentors');
  if (actor.role === 'mentee' || actor.isAdmin) ids.push('mentees');
  return ids;
}

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor) return fail(res, 401, 'UNAUTHORIZED');
    const data = await listNotificationsForActor(actor);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor) return fail(res, 401, 'UNAUTHORIZED');
    const n = await markRead(req.params.id, audienceIds(actor));
    if (!n) return fail(res, 404, 'NOT_FOUND');
    res.json({ success: true, data: n });
  } catch (e) {
    next(e);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor) return fail(res, 401, 'UNAUTHORIZED');
    await markAllRead(audienceIds(actor));
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const io = req.app.get('io');
    const n = await createNotification(req.body, io);
    res.status(201).json({ success: true, data: n });
  } catch (e) {
    next(e);
  }
});

export default router;
