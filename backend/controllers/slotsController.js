import {
  claimIdempotent,
  completeIdempotent,
  createIdempotencyContext,
  releaseIdempotent,
} from '../lib/idempotency.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';
import { parseSlotInput } from '../lib/slotInput.js';
import { createNotification } from '../services/notificationStore.js';
import {
  bookSlot,
  cancelBooking,
  createSlot,
  deleteSlot,
  getSlotById,
  hasSlotConflict,
  listSlots,
  updateSlot,
  withSlotLock,
} from '../services/slotStore.js';

function canManageSlot(actor, slot) {
  if (!actor || !slot) return false;
  if (actor.isAdmin) return true;
  return actor.role === 'mentor' && actor.mentorId === slot.mentorId;
}

function slotError(res, parsed) {
  if (!parsed?.error) return false;
  fail(res, 400, parsed.error === 'SLOT_PAST' ? 'SLOT_PAST' : 'VALIDATION');
  return true;
}

export async function getSlots(req, res, next) {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor' && actor?.role !== 'mentee') {
      return fail(res, 403, 'FORBIDDEN');
    }
    const { mentorId, menteeId, availableOnly } = req.query;
    let list = await listSlots({ mentorId, menteeId, availableOnly });

    if (actor.role === 'mentor' && !actor.isAdmin) {
      list = list.filter((slot) => slot.mentorId === actor.mentorId);
    } else if (actor.role === 'mentee' && !actor.isAdmin) {
      list = list.filter(
        (slot) => !slot.bookedBy || slot.bookedBy === actor.menteeId || slot.menteeId === actor.menteeId
      );
    }

    res.json(list);
  } catch (error) {
    next(error);
  }
}

export async function postSlot(req, res, next) {
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
      if (await hasSlotConflict({ mentorId, ...parsed })) return null;
      return createSlot({ mentorId, ...parsed });
    });
    if (!created) return fail(res, 409, 'SLOT_CONFLICT');

    await createNotification(
      {
        userId: 'mentees',
        title: 'New slot',
        message: `A mentor opened ${created.date} ${created.time}`,
        type: 'info',
        href: '/slots',
      },
      req.app.get('io')
    );
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export async function bookAvailableSlot(req, res, next) {
  let idempotencyContext = null;
  let ownsIdempotencyClaim = false;
  try {
    const actor = await loadActor(req);
    const menteeId = actor?.isAdmin ? req.body.menteeId : actor?.menteeId;
    if (!menteeId) return fail(res, 403, 'FORBIDDEN');

    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    if (slotError(res, parseSlotInput(existing))) return;

    const idempotencyKey = req.get('Idempotency-Key');
    if (idempotencyKey?.length > 200) {
      return fail(res, 400, 'VALIDATION', 'Idempotency-Key is too long');
    }
    idempotencyContext = createIdempotencyContext(req);
    const claim = await claimIdempotent(idempotencyContext);
    if (claim.kind === 'replay') return res.status(claim.status).json(claim.body);
    if (claim.kind === 'conflict') {
      return fail(res, 409, 'IDEMPOTENCY_KEY_REUSED');
    }
    if (claim.kind === 'pending') {
      return fail(res, 409, 'IDEMPOTENCY_IN_PROGRESS');
    }
    ownsIdempotencyClaim = claim.kind === 'claimed';

    const slot = await withSlotLock(existing.mentorId, () => bookSlot(req.params.id, menteeId));
    if (!slot) {
      await completeIdempotent(idempotencyContext, 409, { success: false, code: 'SLOT_TAKEN' });
      ownsIdempotencyClaim = false;
      return fail(res, 409, 'SLOT_TAKEN');
    }
    await completeIdempotent(idempotencyContext, 200, slot);
    ownsIdempotencyClaim = false;

    await createNotification(
      {
        userId: 'mentors',
        title: 'Slot booked',
        message: `A mentee booked ${slot.date} ${slot.time}`,
        type: 'success',
        href: '/slots',
      },
      req.app.get('io')
    );
    res.json(slot);
  } catch (error) {
    if (ownsIdempotencyClaim) {
      try {
        await releaseIdempotent(idempotencyContext);
      } catch {
        // Preserve the original error; the pending record expires automatically.
      }
    }
    next(error);
  }
}

export async function patchSlot(req, res, next) {
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
      return { slot: await updateSlot(req.params.id, parsed) };
    });
    if (result.conflict) return fail(res, 409, 'SLOT_CONFLICT');
    res.json(result.slot);
  } catch (error) {
    next(error);
  }
}

export async function removeBooking(req, res, next) {
  try {
    const actor = await loadActor(req);
    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    const menteeOwns =
      actor?.role === 'mentee' &&
      (existing.menteeId === actor.menteeId || existing.bookedBy === actor.menteeId);
    if (!canManageSlot(actor, existing) && !menteeOwns) return fail(res, 403, 'FORBIDDEN');
    res.json(await cancelBooking(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function removeSlot(req, res, next) {
  try {
    const actor = await loadActor(req);
    const existing = await getSlotById(req.params.id);
    if (!existing) return fail(res, 404, 'NOT_FOUND', 'Slot not found');
    if (!canManageSlot(actor, existing)) return fail(res, 403, 'FORBIDDEN');
    if (existing.bookedBy && !actor.isAdmin) {
      return fail(res, 409, 'SLOT_TAKEN', 'Cancel the booking before deleting this slot');
    }
    res.json(await deleteSlot(req.params.id));
  } catch (error) {
    next(error);
  }
}
