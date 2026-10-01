import express from 'express';
import { validateMentor } from '../middleware/validation.js';
import {
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  queryMentorDirectory,
} from '../services/mentorStore.js';
import { listMentees } from '../services/menteeStore.js';
import { listGroups } from '../services/groupStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';
import { sendDirectory } from '../lib/directoryQuery.js';
import {
  pickFields,
  MENTOR_OWNER_FIELDS,
  MENTOR_ADMIN_FIELDS,
  redactMentor,
  redactMentee,
  mapDirectory,
} from '../lib/profileFields.js';

const router = express.Router();

function ownsMentor(actor, id) {
  return actor?.isAdmin || (actor?.role === 'mentor' && actor.mentorId === id);
}

router.get('/', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const result = await queryMentorDirectory(req.query);
    return sendDirectory(res, mapDirectory(result, (row) => redactMentor(row, actor)));
  } catch (e) {
    next(e);
  }
});

router.post('/', validateMentor, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const mentor = await createMentor(pickFields(req.body, MENTOR_ADMIN_FIELDS));
    res.status(201).json(mentor);
  } catch (e) {
    if (e.code === 'EMAIL_TAKEN') return fail(res, 409, 'EMAIL_TAKEN');
    next(e);
  }
});

router.get('/:id/mentees', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin && actor?.role !== 'mentor') return fail(res, 403, 'FORBIDDEN');
    if (actor.role === 'mentor' && actor.mentorId !== req.params.id) {
      return fail(res, 403, 'FORBIDDEN');
    }
    const mentees = await listMentees();
    res.json(
      mentees
        .filter((m) => m.mentorId === req.params.id)
        .map((m) => redactMentee(m, actor))
    );
  } catch (e) {
    next(e);
  }
});

router.get('/:id/groups', async (req, res, next) => {
  try {
    const groups = await listGroups();
    res.json(groups.filter((g) => g.mentorId === req.params.id));
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    const mentor = await getMentorById(req.params.id);
    if (!mentor) return fail(res, 404, 'NOT_FOUND', 'Mentor not found');
    res.json(redactMentor(mentor, actor));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateMentor, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!ownsMentor(actor, req.params.id)) return fail(res, 403, 'FORBIDDEN');
    const fields = actor.isAdmin ? MENTOR_ADMIN_FIELDS : MENTOR_OWNER_FIELDS;
    const mentor = await updateMentor(req.params.id, pickFields(req.body, fields), { replace: true });
    if (!mentor) return fail(res, 404, 'NOT_FOUND', 'Mentor not found');
    res.json(mentor);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateMentor, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!ownsMentor(actor, req.params.id)) return fail(res, 403, 'FORBIDDEN');
    const fields = actor.isAdmin ? MENTOR_ADMIN_FIELDS : MENTOR_OWNER_FIELDS;
    const mentor = await updateMentor(req.params.id, pickFields(req.body, fields));
    if (!mentor) return fail(res, 404, 'NOT_FOUND', 'Mentor not found');
    res.json(mentor);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const mentor = await deleteMentor(req.params.id);
    if (!mentor) return fail(res, 404, 'NOT_FOUND', 'Mentor not found');
    res.json({ message: 'Mentor deleted' });
  } catch (e) {
    next(e);
  }
});

export default router;
