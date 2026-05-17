import express from 'express';
import {
  listNotifications,
  markRead,
  markAllRead,
  createNotification,
} from '../services/notificationStore.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'all';
    const data = await listNotifications(userId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || 'all';
    const n = await markRead(req.params.id, userId);
    if (!n) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: n });
  } catch (e) {
    next(e);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || 'all';
    await markAllRead(userId);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const io = req.app.get('io');
    const n = await createNotification(req.body, io);
    res.status(201).json({ success: true, data: n });
  } catch (e) {
    next(e);
  }
});

export { createNotification };
export default router;
