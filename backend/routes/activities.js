import express from 'express';
import {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../services/activityStore.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    res.json(await listActivities(limit));
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const activity = await createActivity(req.body);
    res.status(201).json(activity);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const activity = await getActivityById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const activity = await updateActivity(req.params.id, req.body);
    if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const activity = await updateActivity(req.params.id, req.body);
    if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
    res.json(activity);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const activity = await deleteActivity(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Không tìm thấy activity' });
    res.json({ message: 'Đã xóa activity' });
  } catch (e) {
    next(e);
  }
});

export default router;
