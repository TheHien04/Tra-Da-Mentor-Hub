/**
 * Slot rảnh (interview / mentoring) – mentor thêm slot, mentee chọn
 */

import express from 'express';
import { createNotification } from '../services/notificationStore.js';
import {
  listSlots,
  createSlot,
  bookSlot,
  updateSlot,
  getSlotById,
} from '../services/slotStore.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { mentorId, menteeId, availableOnly } = req.query;
    const list = await listSlots({ mentorId, menteeId, availableOnly });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { mentorId, date, time, duration, meetingLink } = req.body;
    if (!mentorId || !date || !time || !duration) {
      return res.status(400).json({ message: 'mentorId, date, time, duration là bắt buộc' });
    }
    const newSlot = await createSlot({ mentorId, date, time, duration, meetingLink });
    const io = req.app.get('io');
    await createNotification(
      {
        userId: 'all',
        title: 'Slot mới',
        message: `Mentor đã mở slot ${newSlot.date} ${newSlot.time}`,
        type: 'info',
        href: '/slots',
      },
      io
    );
    res.status(201).json(newSlot);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/book', async (req, res, next) => {
  try {
    const { menteeId } = req.body;
    if (!menteeId) return res.status(400).json({ message: 'menteeId là bắt buộc' });
    const existing = await getSlotById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy slot' });
    const slot = await bookSlot(req.params.id, menteeId);
    if (!slot) return res.status(400).json({ message: 'Slot đã được đặt' });
    const io = req.app.get('io');
    await createNotification(
      {
        userId: 'all',
        title: 'Slot đã được đặt',
        message: `Mentee đã book slot ${slot.date} ${slot.time}`,
        type: 'success',
        href: '/slots',
      },
      io
    );
    res.json(slot);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { date, time, duration, meetingLink } = req.body;
    const slot = await updateSlot(req.params.id, { date, time, duration, meetingLink });
    if (!slot) return res.status(404).json({ message: 'Không tìm thấy slot' });
    res.json(slot);
  } catch (e) {
    next(e);
  }
});

export default router;
