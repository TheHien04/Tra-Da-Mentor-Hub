import express from 'express';
import {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../services/activityStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';

const router = express.Router();

async function requireAdmin(req, res) {
  const actor = await loadActor(req);
  if (!actor?.isAdmin) {
    fail(res, 403, 'FORBIDDEN');
    return false;
  }
  return true;
}

function clampLimit(value) {
  if (value == null || value === '') return 50;
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(1, n));
}

router.get('/', async (req, res, next) => {
  try {
    res.json(await listActivities(clampLimit(req.query.limit)));
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const activity = await createActivity(req.body);
    res.status(201).json(activity);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const activity = await getActivityById(req.params.id);
    if (!activity) return fail(res, 404, 'NOT_FOUND');
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const activity = await updateActivity(req.params.id, req.body);
    if (!activity) return fail(res, 404, 'NOT_FOUND');
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const activity = await updateActivity(req.params.id, req.body);
    if (!activity) return fail(res, 404, 'NOT_FOUND');
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const activity = await deleteActivity(req.params.id);
    if (!activity) return fail(res, 404, 'NOT_FOUND');
    res.json({ message: 'Đã xóa activity' });
  } catch (e) {
    next(e);
  }
});

export default router;
