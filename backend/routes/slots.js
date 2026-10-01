/**
 * Availability slots — mentors open time, mentees book as themselves.
 */

import express from 'express';
import { createNotification } from '../services/notificationStore.js';
import {
  listSlots,
  createSlot,
  bookSlot,
  updateSlot,
  getSlotById,
  hasSlotConflict,
  cancelBooking,
  deleteSlot,
  withSlotLock,
} from '../services/slotStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';
import { parseSlotInput } from '../lib/slotInput.js';

const router = express.Router();

function canManageSlot(actor, slot) {
  if (!actor || !slot) return false;
  if (actor.isAdmin) return true;
  return actor.role === 'mentor' && actor.mentorId === slot.mentorId;
}

function slotError(res, parsed) {
  if (!parsed?.error) return false;
  if (parsed.error === 'SLOT_PAST') {
    fail(res, 400, 'SLOT_PAST');
    return true;
  }
  fail(res, 400, 'VALIDATION');
  return true;
}

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor' && actor?.role !== 'mentee') {
      return fail(res, 403, 'FORBIDDEN');
    }
    const { mentorId, menteeId, availableOnly } = req.query;
    let list = await listSlots({ mentorId, menteeId, availableOnly });

    if (actor?.role === 'mentor' && !actor.isAdmin) {
      list = list.filter((slot) => slot.mentorId === actor.mentorId);
    } else if (actor?.role === 'mentee' && !actor.isAdmin) {
      list = list.filter(
        (slot) => !slot.bookedBy || slot.bookedBy === actor.menteeId || slot.menteeId === actor.menteeId
      );
    }

    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');

    const mentorId = actor.isAdmin ? req.body.mentorId : actor.mentorId;
    const { date, time, duration, meetingLink } = req.body;
    if (!mentorId || !date || !time || !duration) {
      return fail(res, 400, 'VALIDATION', 'mentorId, date, time, and duration are required');
    }
    if (!actor.isAdmin && req.body.mentorId && req.body.mentorId !== actor.mentorId) {
      return fail(res, 403, 'FORBIDDEN');
    }
    const parsed = parseSlotInput({ date, time, duration, meetingLink });
    if (slotError(res, parsed)) return;

    const created = await withSlotLock(mentorId, async () => {
      const conflict = await hasSlotConflict({ mentorId, ...parsed });
      if (conflict) return null;
      return createSlot({ mentorId, ...parsed });
    });
    if (!created) return fail(res, 409, 'SLOT_CONFLICT');
    const newSlot = created;
    const io = req.app.get('io');
    await createNotification(
      {
        userId: 'mentees',
        title: 'New slot',
        message: `A mentor opened ${newSlot.date} ${newSlot.time}`,
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
    const actor = await loadActor(req);
    const menteeId = actor?.isAdmin ? req.body.menteeId : actor?.menteeId;
    if (!menteeId) return fail(res, 403, 'FORBIDDEN');
    if (!actor.isAdmin && req.body.menteeId && req.body.menteeId !== actor.menteeId) {
      return fail(res, 403, 'FORBIDDEN');
    }

    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    if (slotError(res, parseSlotInput(existing))) return;
    const slot = await withSlotLock(existing.mentorId, () => bookSlot(req.params.id, menteeId));
    if (!slot) return fail(res, 409, 'SLOT_TAKEN');

    const io = req.app.get('io');
    await createNotification(
      {
        userId: 'mentors',
        title: 'Slot booked',
        message: `A mentee booked ${slot.date} ${slot.time}`,
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
    const actor = await loadActor(req);
    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    if (!canManageSlot(actor, existing)) return fail(res, 403, 'FORBIDDEN');

    const parsed = parseSlotInput({
      date: req.body.date || existing.date,
      time: req.body.time || existing.time,
      duration: req.body.duration ?? existing.duration,
      meetingLink: req.body.meetingLink !== undefined ? req.body.meetingLink : existing.meetingLink,
    });
    if (slotError(res, parsed)) return;

    const result = await withSlotLock(existing.mentorId, async () => {
      const conflict = await hasSlotConflict({
        mentorId: existing.mentorId,
        date: parsed.date,
        time: parsed.time,
        duration: parsed.duration,
        ignoreId: existing._id,
      });
      if (conflict) return { conflict: true };
      const slot = await updateSlot(req.params.id, parsed);
      return { slot };
    });
    if (result.conflict) return fail(res, 409, 'SLOT_CONFLICT');
    res.json(result.slot);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id/booking', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    const menteeOwns = actor?.role === 'mentee' && (existing.menteeId === actor.menteeId || existing.bookedBy === actor.menteeId);
    if (!canManageSlot(actor, existing) && !menteeOwns) return fail(res, 403, 'FORBIDDEN');
    const slot = await cancelBooking(req.params.id);
    res.json(slot);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    if (!canManageSlot(actor, existing)) return fail(res, 403, 'FORBIDDEN');
    if (existing.bookedBy && !actor.isAdmin) return fail(res, 409, 'SLOT_TAKEN', 'Cancel the booking before deleting this slot');
    const slot = await deleteSlot(req.params.id);
    res.json(slot);
  } catch (e) {
    next(e);
  }
});

export default router;
