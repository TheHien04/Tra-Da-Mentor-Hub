import express from 'express';
import { validateMentee } from '../middleware/validation.js';
import {
  getMenteeById,
  createMentee,
  updateMentee,
  updateMenteeApplicationStatus,
  deleteMentee,
  APPLICATION_STATUSES,
  queryMenteeDirectory,
} from '../services/menteeStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';
import { sendDirectory } from '../lib/directoryQuery.js';
import {
  pickFields,
  MENTEE_OWNER_FIELDS,
  MENTEE_ADMIN_FIELDS,
  redactMentee,
  mapDirectory,
} from '../lib/profileFields.js';

const router = express.Router();

function canReadMentee(actor, mentee) {
  if (!actor || !mentee) return false;
  if (actor.isAdmin || actor.role === 'mentor') return true;
  return actor.role === 'mentee' && actor.menteeId === mentee._id;
}

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (actor?.role === 'mentee' && !actor.isAdmin) {
      const own = actor.menteeId ? await getMenteeById(actor.menteeId) : null;
      const ownResult = await queryMenteeDirectory(req.query, own ? { _id: own._id } : { _id: '__none__' });
      return sendDirectory(res, mapDirectory(ownResult, (row) => redactMentee(row, actor)));
    }
    if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');
    const result = await queryMenteeDirectory(req.query);
    return sendDirectory(res, mapDirectory(result, (row) => redactMentee(row, actor)));
  } catch (e) {
    next(e);
  }
});

router.post('/', validateMentee, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const mentee = await createMentee(pickFields(req.body, MENTEE_ADMIN_FIELDS));
    res.status(201).json(mentee);
  } catch (e) {
    if (e.code === 'EMAIL_TAKEN') return fail(res, 409, 'EMAIL_TAKEN');
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const mentee = await getMenteeById(req.params.id);
    if (!mentee) return fail(res, 404, 'NOT_FOUND', 'Mentee not found');
    if (!canReadMentee(actor, mentee)) return fail(res, 403, 'FORBIDDEN');
    res.json(redactMentee(mentee, actor));
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/application-status', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');
    const { applicationStatus } = req.body;
    if (!applicationStatus || !APPLICATION_STATUSES.includes(applicationStatus)) {
      return fail(res, 400, 'VALIDATION', `applicationStatus must be: ${APPLICATION_STATUSES.join(', ')}`);
    }
    const result = await updateMenteeApplicationStatus(req.params.id, applicationStatus);
    if (result?.error === 'invalid_status') return fail(res, 400, 'VALIDATION');
    if (!result) return fail(res, 404, 'NOT_FOUND', 'Mentee not found');
    res.json(redactMentee(result, actor));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateMentee, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const owns = actor?.role === 'mentee' && actor.menteeId === req.params.id;
    if (!actor?.isAdmin && !owns) return fail(res, 403, 'FORBIDDEN');
    const fields = actor.isAdmin ? MENTEE_ADMIN_FIELDS : MENTEE_OWNER_FIELDS;
    const mentee = await updateMentee(req.params.id, pickFields(req.body, fields), { replace: true });
    if (!mentee) return fail(res, 404, 'NOT_FOUND', 'Mentee not found');
    res.json(mentee);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateMentee, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const owns = actor?.role === 'mentee' && actor.menteeId === req.params.id;
    if (!actor?.isAdmin && !owns) return fail(res, 403, 'FORBIDDEN');
    const fields = actor.isAdmin ? MENTEE_ADMIN_FIELDS : MENTEE_OWNER_FIELDS;
    const mentee = await updateMentee(req.params.id, pickFields(req.body, fields));
    if (!mentee) return fail(res, 404, 'NOT_FOUND', 'Mentee not found');
    res.json(mentee);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const mentee = await deleteMentee(req.params.id);
    if (!mentee) return fail(res, 404, 'NOT_FOUND', 'Mentee not found');
    res.json({ message: 'Mentee deleted' });
  } catch (e) {
    next(e);
  }
});

export default router;
