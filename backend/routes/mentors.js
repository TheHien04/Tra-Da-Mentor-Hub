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

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await listMentors());
  } catch (e) {
    next(e);
  }
});

router.post('/', validateMentor, async (req, res, next) => {
  try {
    const mentor = await createMentor(req.body);
    res.status(201).json(mentor);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/mentees', async (req, res, next) => {
  try {
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
    if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
    res.json(mentor);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', validateMentor, async (req, res, next) => {
  try {
    const mentor = await updateMentor(req.params.id, req.body, { replace: true });
    if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
    res.json(mentor);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateMentor, async (req, res, next) => {
  try {
    const mentor = await updateMentor(req.params.id, req.body);
    if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
    res.json(mentor);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const mentor = await deleteMentor(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Mentor không tồn tại' });
    res.json({ message: 'Đã xóa mentor' });
  } catch (e) {
    next(e);
  }
});

export default router;
