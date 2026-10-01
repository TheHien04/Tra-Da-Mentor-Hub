import express from 'express';
import { validateMentor } from '../middleware/validation.js';
import {
  listMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
} from '../services/mentorStore.js';
import { listMentees } from '../services/menteeStore.js';
import { listGroups } from '../services/groupStore.js';
import { loadActor } from '../lib/actor.js';
import { fail } from '../lib/httpError.js';
import { sendList } from '../lib/listQuery.js';

const router = express.Router();

function ownsMentor(actor, id) {
  return actor?.isAdmin || (actor?.role === 'mentor' && actor.mentorId === id);
}

router.get('/', async (req, res, next) => {
  try {
    const mentors = await listMentors();
    sendList(res, mentors, req.query, ['name', 'email', 'track', 'bio', 'expertise']);
  } catch (e) {
    next(e);
  }
});

router.post('/', validateMentor, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!actor?.isAdmin) return fail(res, 403, 'FORBIDDEN');
    const mentor = await createMentor(req.body);
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
    res.json(mentees.filter((m) => m.mentorId === req.params.id));
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
    const mentor = await getMentorById(req.params.id);
    if (!mentor) return fail(res, 404, 'NOT_FOUND', 'Mentor not found');
    res.json(mentor);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateMentor, async (req, res, next) => {
  try {
    const actor = await loadActor(req);
    if (!ownsMentor(actor, req.params.id)) return fail(res, 403, 'FORBIDDEN');
    const mentor = await updateMentor(req.params.id, req.body, { replace: true });
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
    const mentor = await updateMentor(req.params.id, req.body);
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
