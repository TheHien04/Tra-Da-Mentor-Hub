import express from 'express';
import { getSummary } from '../controllers/analyticsController.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';

const router = express.Router();

router.get('/summary', async (req, res, next) => {
  const actor = await loadActor(req);
  if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');
  return getSummary(req, res, next);
});

export default router;
