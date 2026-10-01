import express from 'express';
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../services/testimonialStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const { status, track, q } = req.query;
    const data = await listTestimonials({
      status: actor?.isAdmin ? status : 'PUBLISHED',
      track,
      q: typeof q === 'string' ? q.slice(0, 80) : undefined,
    });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const menteeName = String(req.body?.menteeName || '').trim();
    const mentorName = String(req.body?.mentorName || '').trim();
    const content = String(req.body?.content || '').trim();
    if (!menteeName || !mentorName || !content) {
      return fail(res, 400, 'VALIDATION', 'menteeName, mentorName, and content are required');
    }
    const item = await createTestimonial({
      menteeName,
      mentorName,
      content,
      rating: req.body?.rating,
      track: req.body?.track,
      status: 'PENDING',
    });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const allowed = ['status', 'rating', 'content', 'track', 'menteeName', 'mentorName'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    const item = await updateTestimonial(req.params.id, updates);
    if (!item) return fail(res, 404, 'NOT_FOUND');
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const item = await deleteTestimonial(req.params.id);
    if (!item) return fail(res, 404, 'NOT_FOUND');
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
});

export default router;
