import express from 'express';
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../services/testimonialStore.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, track, q } = req.query;
    const data = await listTestimonials({ status, track, q });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { menteeName, mentorName, content, rating, track } = req.body;
    if (!menteeName?.trim() || !mentorName?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'menteeName, mentorName, and content are required',
      });
    }
    const item = await createTestimonial({
      menteeName,
      mentorName,
      content,
      rating,
      track,
      status: 'PENDING',
    });
    res.status(201).json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['status', 'rating', 'content', 'track', 'menteeName', 'mentorName'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    const item = await updateTestimonial(req.params.id, updates);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const item = await deleteTestimonial(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
});

export default router;
